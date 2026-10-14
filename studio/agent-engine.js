/**
 * Hoververse Executive Studio — Site-Aware AI Agent Engine
 * 
 * Translates Natural Language executive requests into precise DOM modifications,
 * manages file assets/attachments, generates visual diffs, and coordinates
 * deployments to both Cloudflare Pages / Static Hosting and Wix Studio (Velo).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(__dirname, 'site-manifest.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'assets', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch (e) {
    return { pages: [] };
  }
}

/**
 * Handle executive natural language edit
 */
async function processExecutiveEdit({ prompt, targetPageId, selectedElement, attachment }) {
  const manifest = loadManifest();
  const lowerPrompt = prompt.toLowerCase();

  // 1. Determine Target Page
  let targetPage = null;
  if (targetPageId) {
    targetPage = manifest.pages.find(p => p.id === targetPageId || p.file === targetPageId);
  }
  if (!targetPage) {
    if (lowerPrompt.includes('platform')) targetPage = manifest.pages.find(p => p.id === 'platform');
    else if (lowerPrompt.includes('about')) targetPage = manifest.pages.find(p => p.id === 'about');
    else if (lowerPrompt.includes('career')) targetPage = manifest.pages.find(p => p.id === 'careers');
    else if (lowerPrompt.includes('solution')) targetPage = manifest.pages.find(p => p.id === 'solutions');
    else if (lowerPrompt.includes('resource') || lowerPrompt.includes('whitepaper')) targetPage = manifest.pages.find(p => p.id === 'resources');
    else targetPage = manifest.pages.find(p => p.id === 'home');
  }

  const targetFilePath = path.join(ROOT_DIR, targetPage.file);
  if (!fs.existsSync(targetFilePath)) {
    throw new Error(`Target file ${targetPage.file} does not exist.`);
  }

  let htmlContent = fs.readFileSync(targetFilePath, 'utf-8');
  const originalContent = htmlContent;
  let summary = '';
  let modified = false;

  // 2. Handle Attached Image / Asset (e.g. "change the picture ... to this one [pasted jpeg]")
  let savedAssetPath = null;
  if (attachment && attachment.dataUrl) {
    const matches = attachment.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches) {
      const ext = matches[1].split('/')[1] === 'jpeg' ? 'jpg' : (matches[1].split('/')[1] || 'png');
      const filename = `exec_${Date.now()}_${(attachment.name || 'image').replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
      const fullPath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(fullPath, Buffer.from(matches[2], 'base64'));
      savedAssetPath = `assets/uploads/${filename}`;
    }
  }

  // 3. Scenario A: "change the picture on the platform page adjacent to deterministic by design section"
  if (
    (lowerPrompt.includes('deterministic') || lowerPrompt.includes('pipeline') || (selectedElement && selectedElement.includes('pipe')))
    && (lowerPrompt.includes('picture') || lowerPrompt.includes('image') || lowerPrompt.includes('photo') || savedAssetPath)
  ) {
    const assetToUse = savedAssetPath || 'assets/uploads/deterministic_preview.jpg';
    
    // Look for .pipe-stage container
    const pipeStageRegex = /<div class="pipe-stage[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    if (pipeStageRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(pipeStageRegex, (match) => {
        return `<div class="pipe-stage reveal" style="display:flex;align-items:center;justify-content:center;background:#0d141c;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        <img src="${assetToUse}" alt="Deterministic by design pipeline visualization" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <span class="tag">SurfaceWare Pipeline</span>
      </div>`;
      });
      modified = true;
      summary = `Replaced the visual graphic adjacent to the 'Deterministic by Design' section on ${targetPage.file} with the new image (${assetToUse}).`;
    }
  }

  // 4. Scenario B: "change the wording on the home page at the very top" (Hero headline/kicker)
  else if (
    (lowerPrompt.includes('very top') || lowerPrompt.includes('headline') || lowerPrompt.includes('hero') || lowerPrompt.includes('wording'))
    && targetPage.id === 'home'
  ) {
    // Extract new text from prompt or attachment text
    let newHeadline = null;
    let newKicker = null;

    // Check if user quoted text e.g. "..."
    const quotedMatches = prompt.match(/["“]([^"”]+)["”]/g);
    if (quotedMatches && quotedMatches.length > 0) {
      newHeadline = quotedMatches[0].replace(/["“”]/g, '').trim();
      if (quotedMatches.length > 1) {
        newKicker = quotedMatches[1].replace(/["“”]/g, '').trim();
      }
    } else {
      // Common clean phrases
      const afterReflect = prompt.match(/reflect(?:ing)?\s+(?:messaging\s+)?(?:like\s+|as\s+|in\s+)?[:\-]?\s*([A-Za-z0-9\s.,'’—–-]+)/i);
      if (afterReflect) {
        newHeadline = afterReflect[1].trim();
      }
    }

    if (!newHeadline && attachment && attachment.textContent) {
      const lines = attachment.textContent.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) newHeadline = lines[0];
      if (lines.length > 1) newKicker = lines[1];
    }

    if (newHeadline) {
      // Replace hero h1
      const h1Regex = /<h1 class="h-hero[^"]*"[^>]*>[\s\S]*?<\/h1>/;
      if (h1Regex.test(htmlContent)) {
        htmlContent = htmlContent.replace(h1Regex, `<h1 class="h-hero reveal d1">${newHeadline}</h1>`);
        modified = true;
        summary = `Updated the main hero headline at the top of the Home page to: "${newHeadline}".`;
      }
      if (newKicker) {
        const kickerRegex = /<p class="kicker[^"]*"[^>]*>[\s\S]*?<\/p>/;
        if (kickerRegex.test(htmlContent)) {
          htmlContent = htmlContent.replace(kickerRegex, `<p class="kicker reveal">${newKicker}</p>`);
          summary += ` Also updated kicker eyebrow to: "${newKicker}".`;
        }
      }
    }
  }

  // 5. Scenario C: General Text / Heading / CTA Replacement
  if (!modified) {
    const quoted = prompt.match(/["“]([^"”]+)["”]\s*(?:to|with|into)\s*["“]([^"”]+)["”]/i);
    if (quoted) {
      const fromText = quoted[1];
      const toText = quoted[2];
      if (htmlContent.includes(fromText)) {
        htmlContent = htmlContent.replace(fromText, toText);
        modified = true;
        summary = `Replaced text "${fromText}" with "${toText}" on ${targetPage.file}.`;
      }
    }
  }

  // 6. Scenario D: Targeted Element Edit via Visual Inspector Selection
  if (!modified && selectedElement && selectedElement.text && selectedElement.newText) {
    if (htmlContent.includes(selectedElement.text)) {
      htmlContent = htmlContent.replace(selectedElement.text, selectedElement.newText);
      modified = true;
      summary = `Updated inspected element on ${targetPage.file} with new content.`;
    }
  }

  // 7. Fallback: If OpenAI or Gemini API key is provided, perform deep LLM AST transformation
  if (!modified && process.env.GEMINI_API_KEY) {
    try {
      summary = await runLlmTransformation({ prompt, htmlContent, targetPage, savedAssetPath });
      modified = true;
    } catch (e) {
      console.warn("LLM transformation error:", e.message);
    }
  }

  if (modified) {
    fs.writeFileSync(targetFilePath, htmlContent, 'utf-8');
  } else {
    summary = `Understood the request, but could not locate the exact element on ${targetPage.file}. Try selecting the element directly in the Visual Inspector on the right, or quote the exact text to replace.`;
  }

  const gitDiff = getUncommittedDiff();

  return {
    success: modified,
    summary,
    targetPage: targetPage.file,
    pageUrl: targetPage.url,
    diff: gitDiff,
    savedAsset: savedAssetPath
  };
}

/**
 * Return uncommitted git diff
 */
function getUncommittedDiff() {
  try {
    return execSync('git diff --stat -p', { cwd: ROOT_DIR, encoding: 'utf-8' });
  } catch (e) {
    return 'No git diff available.';
  }
}

/**
 * Discard uncommitted sandbox changes
 */
function revertSandbox() {
  try {
    execSync('git checkout .', { cwd: ROOT_DIR });
    return { success: true, message: 'All sandbox changes have been reverted to pristine git state.' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Deploy / Commit to Pipeline
 */
async function publishChanges({ target, commitMessage }) {
  const msg = commitMessage || `feat(content): executive updates applied via Hoververse Studio [${new Date().toISOString()}]`;
  const results = { target, logs: [] };

  if (target === 'cloudflare' || target === 'static' || target === 'all') {
    try {
      execSync('git add -A', { cwd: ROOT_DIR });
      execSync(`git commit -m "${msg}"`, { cwd: ROOT_DIR });
      execSync('git push origin main', { cwd: ROOT_DIR });
      results.logs.push('Successfully pushed changes to primary git repository (Cloudflare Pages / Vercel auto-deploy).');
    } catch (e) {
      results.logs.push(`Cloudflare push log: ${e.message}`);
    }
  }

  if (target === 'wix' || target === 'all') {
    try {
      const wixCompiler = require('./wix-compiler');
      const compileReport = wixCompiler.compileAllPagesToWix();
      results.logs.push(`Compiled ${compileReport.compiledCount} pages into Wix Velo Custom Elements.`);

      const wixRepoDir = path.join(ROOT_DIR, 'wix-repo');
      if (fs.existsSync(wixRepoDir)) {
        execSync('git add -A', { cwd: wixRepoDir });
        execSync(`git commit -m "${msg}"`, { cwd: wixRepoDir });
        execSync('git push origin main', { cwd: wixRepoDir });
        results.logs.push('Successfully pushed compiled components to Wix Studio GitHub repository.');
      }
    } catch (e) {
      results.logs.push(`Wix compilation/push log: ${e.message}`);
    }
  }

  return results;
}

module.exports = {
  processExecutiveEdit,
  getUncommittedDiff,
  revertSandbox,
  publishChanges,
  loadManifest
};
