/**
 * Hoververse Wix Studio Compiler
 * 
 * Automatically compiles native static HTML pages into Wix Velo Custom Elements
 * in wix-repo/src/public/ and wix-repo/src/public/custom-elements/.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WIX_REPO_DIR = path.join(ROOT_DIR, 'wix-repo');
const WIX_PUBLIC_DIR = path.join(WIX_REPO_DIR, 'src', 'public');
const WIX_CE_DIR = path.join(WIX_PUBLIC_DIR, 'custom-elements');

const PAGE_MAPPING = [
  { htmlFile: 'index.html', tagName: 'hoververse-home', className: 'HoververseHome', jsFile: 'hoververse-home.js' },
  { htmlFile: 'platform.html', tagName: 'hoververse-platform', className: 'HoverversePlatform', jsFile: 'hoververse-platform.js' },
  { htmlFile: 'about.html', tagName: 'hoververse-about', className: 'HoververseAbout', jsFile: 'hoververse-about.js' },
  { htmlFile: 'careers.html', tagName: 'hoververse-careers', className: 'HoververseCareers', jsFile: 'hoververse-careers.js' },
  { htmlFile: 'solutions.html', tagName: 'hoververse-solutions', className: 'HoververseSolutions', jsFile: 'hoververse-solutions.js' },
  { htmlFile: 'resources.html', tagName: 'hoververse-resources', className: 'HoververseResources', jsFile: 'hoververse-resources.js' },
  { htmlFile: 'why-hoververse.html', tagName: 'hoververse-why-hoververse', className: 'HoververseWhyHoververse', jsFile: 'hoververse-why-hoververse.js' },
  { htmlFile: 'hover-health.html', tagName: 'hoververse-hover-health', className: 'HoververseHoverHealth', jsFile: 'hoververse-hover-health.js' },
  { htmlFile: 'biosafety.html', tagName: 'hoververse-biosafety', className: 'HoververseBiosafety', jsFile: 'hoververse-biosafety.js' },
  { htmlFile: 'living-heritage.html', tagName: 'hoververse-living-heritage', className: 'HoververseLivingHeritage', jsFile: 'hoververse-living-heritage.js' },
  { htmlFile: 'hover-sr.html', tagName: 'hoververse-hover-sr', className: 'HoververseHoverSr', jsFile: 'hoververse-hover-sr.js' }
];

function compileAllPagesToWix() {
  if (!fs.existsSync(WIX_REPO_DIR)) {
    return { compiledCount: 0, message: 'wix-repo directory not found.' };
  }

  let count = 0;
  for (const page of PAGE_MAPPING) {
    const srcPath = path.join(ROOT_DIR, page.htmlFile);
    if (!fs.existsSync(srcPath)) continue;

    const html = fs.readFileSync(srcPath, 'utf-8');

    // Extract styles
    let styles = '';
    const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g);
    for (const sm of styleMatches) {
      styles += '\n' + sm[1];
    }
    // Also include styles.css if available
    const stylesCssPath = path.join(ROOT_DIR, 'styles.css');
    if (fs.existsSync(stylesCssPath)) {
      styles = fs.readFileSync(stylesCssPath, 'utf-8') + '\n' + styles;
    }

    // Extract body content (inside <main> or between header/footer)
    let body = '';
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    if (mainMatch) {
      body = mainMatch[0];
    } else {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
      body = bodyMatch ? bodyMatch[1] : html;
    }

    // Generate Custom Element Code
    const ceCode = `/**
 * Hoververse ${page.tagName} Custom Element
 * Tag: <${page.tagName}>
 * Auto-compiled from ${page.htmlFile} via Hoververse Studio
 */

class ${page.className} extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = \`
      <style>
        :host {
          display: block !important;
          width: 100% !important;
          min-width: 100% !important;
          box-sizing: border-box !important;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
        }
        * { box-sizing: border-box !important; }
        ${styles.replace(/`/g, '\\`').replace(/\$/g, '\\$')}
      </style>
      ${body.replace(/`/g, '\\`').replace(/\$/g, '\\$')}
    \`;

    // Intercept clicks for internal routing
    shadow.addEventListener('click', (e) => {
      const compPath = e.composedPath ? e.composedPath() : [e.target];
      const a = compPath.find(el => el && el.tagName === 'A');
      if (!a) return;
      const rawHref = a.getAttribute('href');
      if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || a.getAttribute('target') === '_blank') return;
      
      e.preventDefault();
      try {
        if (window.top && window.top.location) {
          window.top.location.href = rawHref;
          return;
        }
      } catch (err) {}
      window.location.href = rawHref;
    });
  }
}

if (!customElements.get('${page.tagName}')) {
  customElements.define('${page.tagName}', ${page.className});
}
`;

    // Write to both public and custom-elements folders
    const pubDest = path.join(WIX_PUBLIC_DIR, page.jsFile);
    const ceDest = path.join(WIX_CE_DIR, page.jsFile);

    fs.writeFileSync(pubDest, ceCode, 'utf-8');
    if (fs.existsSync(WIX_CE_DIR)) {
      fs.writeFileSync(ceDest, ceCode, 'utf-8');
    }
    count++;
  }

  return { compiledCount: count };
}

module.exports = {
  compileAllPagesToWix,
  PAGE_MAPPING
};
