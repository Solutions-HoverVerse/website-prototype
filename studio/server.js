/**
 * Hoververse Executive Studio — Local Server & API
 * 
 * Zero-dependency native Node.js HTTP server.
 * Run with: node studio/server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const agentEngine = require('./agent-engine');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');
const STUDIO_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

// Script automatically injected into preview pages for point-and-click element inspection
const INJECTED_INSPECTOR_SCRIPT = `
<script>
  (function() {
    let inspectorActive = false;
    let hoveredEl = null;

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.pointerEvents = 'none';
    overlay.style.border = '2px solid #12A06A';
    overlay.style.background = 'rgba(18, 160, 106, 0.15)';
    overlay.style.borderRadius = '4px';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'none';
    overlay.style.transition = 'all 0.1s ease';
    document.body.appendChild(overlay);

    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'HV_TOGGLE_INSPECTOR') {
        inspectorActive = !!e.data.enabled;
        if (!inspectorActive) {
          overlay.style.display = 'none';
          if (hoveredEl) hoveredEl.style.cursor = '';
        }
      }
    });

    document.addEventListener('mouseover', function(e) {
      if (!inspectorActive) return;
      hoveredEl = e.target;
      hoveredEl.style.cursor = 'crosshair';
      const r = hoveredEl.getBoundingClientRect();
      overlay.style.top = r.top + 'px';
      overlay.style.left = r.left + 'px';
      overlay.style.width = r.width + 'px';
      overlay.style.height = r.height + 'px';
      overlay.style.display = 'block';
    }, true);

    document.addEventListener('click', function(e) {
      if (!inspectorActive) return;
      e.preventDefault();
      e.stopPropagation();

      const el = e.target;
      const info = {
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        className: el.className || '',
        text: (el.innerText || el.textContent || '').trim().slice(0, 120),
        src: el.src || '',
        href: el.href || ''
      };

      window.parent.postMessage({
        type: 'HV_ELEMENT_SELECTED',
        info: info
      }, '*');
    }, true);
  })();
</script>
`;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Studio Web App UI
  if (pathname === '/' || pathname === '/index.html') {
    const indexPath = path.join(STUDIO_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(indexPath));
    return;
  }

  // 2. API Endpoints
  if (pathname === '/api/edit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const result = await agentEngine.processExecutiveEdit(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, summary: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/diff' && req.method === 'GET') {
    const diff = agentEngine.getUncommittedDiff();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ diff }));
    return;
  }

  if (pathname === '/api/revert' && req.method === 'POST') {
    const result = agentEngine.revertSandbox();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  if (pathname === '/api/publish' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = await agentEngine.publishChanges(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 3. Sandbox Preview Route: /preview/*
  if (pathname.startsWith('/preview/')) {
    let relative = pathname.replace('/preview/', '') || 'index.html';
    if (relative === '' || relative === '/') relative = 'index.html';

    const filePath = path.join(ROOT_DIR, relative);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';

      if (ext === '.html') {
        let html = fs.readFileSync(filePath, 'utf-8');
        // Inject inspector script right before </body>
        if (html.includes('</body>')) {
          html = html.replace('</body>', INJECTED_INSPECTOR_SCRIPT + '</body>');
        } else {
          html += INJECTED_INSPECTOR_SCRIPT;
        }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(html);
        return;
      }

      res.writeHead(200, { 'Content-Type': mime });
      res.end(fs.readFileSync(filePath));
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Sandbox file not found: ${relative}`);
      return;
    }
  }

  // 4. Static Assets from root
  const directPath = path.join(ROOT_DIR, pathname);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    const ext = path.extname(directPath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(directPath));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Hoververse Executive Studio is live at:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
