/**
 * Hoververse Executive Studio — Site-Aware AI Agent Engine
 * 
 * Supports:
 * - Extended image formats: PNG, JPG, JPEG, GIF (animated), WebP, SVG, AVIF, BMP
 * - Extended video formats: MP4, WebM, MOV, OGG (with autoplay, loop, muted, controls)
 * - Dynamic layout rearrangement (Split-grid 2-column, media banners, section insertion)
 * - Arbitrary element targeting & insertion into undefined panels
 * - Safe sandbox hot-reloading and dual-pipeline deployment (Cloudflare Pages + Wix Studio)
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

const undoStack = []; // array of { file, beforeHtml, afterHtml, summary, timestamp }

function pushUndoSnapshot(file, beforeHtml, afterHtml, summary) {
  undoStack.push({
    file,
    beforeHtml,
    afterHtml,
    summary,
    timestamp: Date.now()
  });
  if (undoStack.length > 50) undoStack.shift();
}

function undoLastChange() {
  if (undoStack.length === 0) {
    return { success: false, message: 'No more changes to undo.', canUndo: false };
  }
  const last = undoStack.pop();
  const filePath = path.join(ROOT_DIR, last.file);
  try {
    fs.writeFileSync(filePath, last.beforeHtml, 'utf-8');
    return {
      success: true,
      summary: `Undid: ${last.summary}`,
      file: last.file,
      canUndo: undoStack.length > 0,
      diff: getUncommittedDiff()
    };
  } catch (err) {
    return { success: false, error: err.message, canUndo: undoStack.length > 0 };
  }
}

function canUndo() {
  return undoStack.length > 0;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Save an uploaded media asset (image, animated GIF, or video) to assets/uploads/
 */
function saveUploadedAsset({ name, dataUrl, buffer }) {
  let ext = 'png';
  let fileBuffer = null;

  if (dataUrl) {
    const mimeMatch = dataUrl.match(/^data:([A-Za-z0-9\/-]+);base64,(.+)$/);
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('mp4')) ext = 'mp4';
      else if (mime.includes('webm')) ext = 'webm';
      else if (mime.includes('quicktime') || mime.includes('mov')) ext = 'mov';
      else if (mime.includes('ogg')) ext = 'ogg';
      else if (mime.includes('avif')) ext = 'avif';

      fileBuffer = Buffer.from(mimeMatch[2], 'base64');
    }
  } else if (buffer) {
    fileBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  if (name && name.includes('.')) {
    const namedExt = name.split('.').pop().toLowerCase();
    if (['gif', 'mp4', 'webm', 'mov', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'avif', 'bmp', 'ogg'].includes(namedExt)) {
      ext = namedExt;
    }
  }

  if (!fileBuffer) {
    throw new Error('No valid file buffer or dataUrl provided.');
  }

  const cleanBaseName = (name || 'media').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `exec_${Date.now()}_${cleanBaseName}.${ext}`;
  const fullPath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(fullPath, fileBuffer);
  const isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);

  return {
    assetPath: `assets/uploads/${filename}`,
    filename,
    ext,
    isVideo,
    isImage: !isVideo
  };
}

/**
 * Robust Element Finder & Range Boundary Calculator
 */
function findElementRange(html, elInfo) {
  if (!elInfo) return null;

  // Strategy 1: Match by ID
  if (elInfo.id) {
    const idRegex = new RegExp(`id=["']${escapeRegExp(elInfo.id)}["']`, 'i');
    const match = idRegex.exec(html);
    if (match) {
      return expandElementBounds(html, match.index, elInfo.tag);
    }
  }

  // Strategy 2: Match by exact src (for existing img/video)
  if (elInfo.src) {
    const cleanSrc = elInfo.src.replace(/^https?:\/\/[^\/]+(\/preview)?\//, '').trim();
    const baseSrc = path.basename(cleanSrc);
    let srcIdx = html.indexOf(cleanSrc);
    if (srcIdx === -1 && baseSrc.length > 3) {
      srcIdx = html.indexOf(baseSrc);
    }
    if (srcIdx !== -1) {
      return expandElementBounds(html, srcIdx, elInfo.tag || 'img');
    }
  }

  // Strategy 3: Match by distinctive outer opening tag
  if (elInfo.outerOpening && elInfo.outerOpening.length > 5) {
    const openIdx = html.indexOf(elInfo.outerOpening);
    if (openIdx !== -1) {
      return expandElementBounds(html, openIdx, elInfo.tag);
    }
  }

  // Strategy 4: Match by text snippet (firstLine or clean text)
  const candidateText = (elInfo.firstLine || elInfo.text || '').trim();
  if (candidateText && candidateText.length >= 6) {
    const snippet = candidateText.slice(0, 36);
    let textIdx = html.indexOf(snippet);
    if (textIdx !== -1) {
      return expandElementBounds(html, textIdx, elInfo.tag);
    }

    const words = candidateText.replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3)
      .slice(0, 4);

    if (words.length >= 2) {
      const flexPattern = words.map(w => escapeRegExp(w)).join('[\\s\\S]{1,60}?');
      try {
        const flexRegex = new RegExp(flexPattern, 'i');
        const flexMatch = flexRegex.exec(html);
        if (flexMatch) {
          return expandElementBounds(html, flexMatch.index, elInfo.tag);
        }
      } catch (e) {}
    }
  }

  // Strategy 5: Match by distinctive class
  if (elInfo.className && typeof elInfo.className === 'string') {
    const classes = elInfo.className.trim().split(/\s+/).filter(c => c && !['reveal', 'd1', 'd2', 'd3', 'd4'].includes(c));
    for (const cls of classes) {
      const clsRegex = new RegExp(`<${elInfo.tag || '[a-zA-Z0-9]+'}[^>]*class=["'][^"']*\\b${escapeRegExp(cls)}\\b[^"']*["']`, 'i');
      const match = clsRegex.exec(html);
      if (match) {
        return expandElementBounds(html, match.index, elInfo.tag);
      }
    }
  }

  return null;
}

function expandElementBounds(html, index, tagHint) {
  let openIdx = index;
  while (openIdx >= 0) {
    const candidate = html.lastIndexOf('<', openIdx);
    if (candidate === -1) break;
    if (html[candidate + 1] !== '/' && html[candidate + 1] !== '!') {
      openIdx = candidate;
      break;
    }
    openIdx = candidate - 1;
  }
  if (openIdx < 0) openIdx = index;

  const tagMatch = html.slice(openIdx).match(/^<([a-zA-Z0-9-]+)/);
  const tagName = (tagMatch ? tagMatch[1] : (tagHint || 'div')).toLowerCase();

  if (['img', 'input', 'hr', 'br', 'source'].includes(tagName)) {
    const closeIdx = html.indexOf('>', openIdx);
    return {
      start: openIdx,
      end: closeIdx !== -1 ? closeIdx + 1 : openIdx + 10,
      tagName,
      outerHtml: html.slice(openIdx, closeIdx + 1)
    };
  }

  const closingTag = `</${tagName}>`;
  let closeIdx = html.indexOf(closingTag, index);
  if (closeIdx === -1) {
    closeIdx = html.indexOf(closingTag, openIdx);
  }

  if (closeIdx !== -1) {
    const end = closeIdx + closingTag.length;
    return {
      start: openIdx,
      end,
      tagName,
      outerHtml: html.slice(openIdx, end)
    };
  }

  const endTag = html.indexOf('>', openIdx) + 1;
  return {
    start: openIdx,
    end: endTag,
    tagName,
    outerHtml: html.slice(openIdx, endTag)
  };
}

/**
 * Update inline styles of an element in HTML source code
 */
function updateElementInlineStyles(html, elInfo, newStyles) {
  const bounds = findElementRange(html, elInfo);
  if (!bounds) return null;

  const targetBlock = html.slice(bounds.start, bounds.end);
  const tagOpenEnd = targetBlock.indexOf('>');
  if (tagOpenEnd === -1) return null;

  const openingTag = targetBlock.slice(0, tagOpenEnd + 1);

  // Parse existing style attribute or create new one
  const styleMatch = openingTag.match(/style=["']([^"']*)["']/i);
  let styleObj = {};
  if (styleMatch) {
    const rawDeclarations = styleMatch[1].split(';');
    for (const decl of rawDeclarations) {
      const colonIdx = decl.indexOf(':');
      if (colonIdx !== -1) {
        const prop = decl.slice(0, colonIdx).trim().toLowerCase();
        const val = decl.slice(colonIdx + 1).trim();
        if (prop && val) styleObj[prop] = val;
      }
    }
  }

  // Merge new styles (convert camelCase if needed, e.g. maxHeight -> max-height)
  for (const [key, val] of Object.entries(newStyles)) {
    const cssProp = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (val === '' || val === null || val === undefined) {
      delete styleObj[cssProp];
    } else {
      styleObj[cssProp] = val;
    }
  }

  // Format style string
  const newStyleStr = Object.entries(styleObj)
    .map(([p, v]) => `${p}:${v}`)
    .join(';');

  let newOpeningTag = '';
  if (styleMatch) {
    newOpeningTag = openingTag.replace(styleMatch[0], `style="${newStyleStr}"`);
  } else {
    // Insert style attribute right before closing > of opening tag
    newOpeningTag = openingTag.slice(0, -1) + ` style="${newStyleStr}">`;
  }

  const newBlock = newOpeningTag + targetBlock.slice(tagOpenEnd + 1);
  const updatedHtml = html.slice(0, bounds.start) + newBlock + html.slice(bounds.end);

  return {
    updatedHtml,
    tagName: bounds.tagName,
    appliedStyles: newStyleStr
  };
}

/**
 * Persist visual element resize, crop, or style change
 */
async function processElementResize({ targetPageId, selectedElement, styles }) {
  const manifest = loadManifest();
  let targetPage = null;
  if (targetPageId) {
    targetPage = manifest.pages.find(p => p.id === targetPageId || p.file === targetPageId);
  }
  if (!targetPage) targetPage = manifest.pages.find(p => p.id === 'home');

  const targetFilePath = path.join(ROOT_DIR, targetPage.file);
  if (!fs.existsSync(targetFilePath)) {
    throw new Error(`Target file ${targetPage.file} does not exist.`);
  }

  const originalHtml = fs.readFileSync(targetFilePath, 'utf-8');
  const result = updateElementInlineStyles(originalHtml, selectedElement, styles);
  if (!result) {
    return { success: false, summary: 'Could not locate element to resize in HTML.', canUndo: canUndo() };
  }

  let desc = '';
  if (styles.fontSize) {
    desc = `font-size: ${styles.fontSize}${styles.width ? ` · w: ${styles.width}` : ''}`;
  } else {
    const dimStr = [styles.width ? `w:${styles.width}` : '', styles.height || styles.maxHeight ? `h:${styles.height || styles.maxHeight}` : ''].filter(Boolean).join(' × ');
    desc = dimStr || 'custom styles';
  }
  const summary = `Resized <${result.tagName}> on ${targetPage.file} (${desc}).`;

  pushUndoSnapshot(targetPage.file, originalHtml, result.updatedHtml, summary);
  fs.writeFileSync(targetFilePath, result.updatedHtml, 'utf-8');

  return {
    success: true,
    summary,
    targetPage: targetPage.file,
    pageUrl: targetPage.url,
    canUndo: true,
    diff: getUncommittedDiff()
  };
}

/**
 * Handle executive natural language edit & DOM rearrangement
 */
async function processExecutiveEdit({ prompt = '', targetPageId, selectedElement, actionType = 'auto', attachment, assetPath }) {
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

  // 2. Resolve Asset (image, animated GIF, or video)
  let savedAssetPath = assetPath || null;
  let isVideo = false;

  if (!savedAssetPath && attachment && attachment.dataUrl) {
    const saved = saveUploadedAsset(attachment);
    savedAssetPath = saved.assetPath;
    isVideo = saved.isVideo;
  } else if (savedAssetPath) {
    const ext = savedAssetPath.split('.').pop().toLowerCase();
    isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);
  }

  // Generate appropriate HTML5 media tag (video or image/GIF)
  let mediaTag = '';
  if (savedAssetPath) {
    if (isVideo) {
      mediaTag = `<video src="${savedAssetPath}" autoplay loop muted playsinline controls style="width:100%;height:100%;max-height:480px;object-fit:cover;display:block;border-radius:16px;"></video>`;
    } else {
      mediaTag = `<img src="${savedAssetPath}" alt="Hoververse interactive visual" style="width:100%;height:100%;max-height:480px;object-fit:cover;display:block;border-radius:16px;" loading="lazy" />`;
    }
  }

  // 3. Determine Layout Action (insert_beside, insert_beside_left, insert_below, insert_above, replace)
  let effectiveAction = actionType;
  if (effectiveAction === 'auto') {
    if (
      lowerPrompt.includes('beside') ||
      lowerPrompt.includes('next to') ||
      lowerPrompt.includes('adjacent') ||
      lowerPrompt.includes('split') ||
      lowerPrompt.includes('two column') ||
      lowerPrompt.includes('side by side') ||
      lowerPrompt.includes('rearrange')
    ) {
      effectiveAction = 'insert_beside';
    } else if (lowerPrompt.includes('below') || lowerPrompt.includes('under') || lowerPrompt.includes('after') || lowerPrompt.includes('beneath')) {
      effectiveAction = 'insert_below';
    } else if (lowerPrompt.includes('above') || lowerPrompt.includes('before') || lowerPrompt.includes('on top')) {
      effectiveAction = 'insert_above';
    } else if (lowerPrompt.includes('replace') || lowerPrompt.includes('change the picture') || lowerPrompt.includes('swap') || lowerPrompt.includes('change image')) {
      effectiveAction = 'replace';
    } else if (selectedElement && selectedElement.tag && ['img', 'video', 'canvas'].includes(selectedElement.tag)) {
      effectiveAction = 'replace';
    } else if (savedAssetPath) {
      effectiveAction = 'insert_beside'; // Default when adding new media to a text element
    }
  }

  // 4. Insertion / Rearrangement with Selected Element
  if (savedAssetPath && selectedElement) {
    const bounds = findElementRange(htmlContent, selectedElement);
    if (bounds) {
      let blockStart = bounds.start;
      let blockEnd = bounds.end;
      let targetBlock = htmlContent.slice(blockStart, blockEnd);

      // Optional caption extraction from prompt
      const captionMatch = prompt.match(/caption(?:ed)?\s+["“]([^"”]+)["”]/i) || prompt.match(/with caption\s+([^,.]+)/i);
      const captionHtml = captionMatch ? `\n    <div class="media-caption">${captionMatch[1].trim()}</div>` : '';

      // A: REPLACE existing element
      if (effectiveAction === 'replace') {
        htmlContent = htmlContent.slice(0, blockStart) + mediaTag + htmlContent.slice(blockEnd);
        modified = true;
        summary = `Replaced <${bounds.tagName}> with new ${isVideo ? 'video' : (savedAssetPath.endsWith('.gif') ? 'animated GIF' : 'image')} (${savedAssetPath}).`;
      }

      // B: INSERT BESIDE (Split-grid 2-column rearrangement)
      else if (effectiveAction === 'insert_beside' || effectiveAction === 'insert_beside_left') {
        const isReverse = effectiveAction === 'insert_beside_left' || lowerPrompt.includes('media left') || lowerPrompt.includes('left side');

        // Contextual grouping: if user clicked on <p>, include preceding <h2>/<h3>/kicker if directly adjacent
        if (bounds.tagName === 'p') {
          const textBefore = htmlContent.slice(Math.max(0, blockStart - 350), blockStart);
          const headingMatch = textBefore.match(/(<(?:h[1-6]|p class="kicker")[^>]*>[\s\S]*?<\/(?:h[1-6]|p)>)\s*$/i);
          if (headingMatch) {
            blockStart -= headingMatch[0].length;
            targetBlock = htmlContent.slice(blockStart, blockEnd);
          }
        } else if (/^h[1-6]$/.test(bounds.tagName)) {
          // If clicked on heading, include subsequent <p> if directly adjacent
          const textAfter = htmlContent.slice(blockEnd, Math.min(htmlContent.length, blockEnd + 400));
          const pMatch = textAfter.match(/^\s*(<p[^>]*>[\s\S]*?<\/p>)/i);
          if (pMatch) {
            blockEnd += pMatch[0].length;
            targetBlock = htmlContent.slice(blockStart, blockEnd);
          }
        }

        const splitGridHtml = `
<div class="split-media-grid${isReverse ? ' reverse' : ''}">
  <div class="split-text-col">
    ${targetBlock}
  </div>
  <div class="split-media-col">
    ${mediaTag}${captionHtml}
  </div>
</div>`;

        htmlContent = htmlContent.slice(0, blockStart) + splitGridHtml + htmlContent.slice(blockEnd);
        modified = true;
        summary = `Inserted new ${isVideo ? 'video' : (savedAssetPath.endsWith('.gif') ? 'animated GIF' : 'image')} and rearranged surrounding ${bounds.tagName} text into a responsive 2-column split layout.`;
      }

      // C: INSERT BELOW
      else if (effectiveAction === 'insert_below') {
        const bannerHtml = `\n<div class="media-banner-panel">\n  ${mediaTag}${captionHtml}\n</div>\n`;
        htmlContent = htmlContent.slice(0, blockEnd) + bannerHtml + htmlContent.slice(blockEnd);
        modified = true;
        summary = `Inserted new ${isVideo ? 'video' : (savedAssetPath.endsWith('.gif') ? 'animated GIF' : 'image')} panel directly below the selected <${bounds.tagName}>.`;
      }

      // D: INSERT ABOVE
      else if (effectiveAction === 'insert_above') {
        const bannerHtml = `\n<div class="media-banner-panel">\n  ${mediaTag}${captionHtml}\n</div>\n`;
        htmlContent = htmlContent.slice(0, blockStart) + bannerHtml + htmlContent.slice(blockStart);
        modified = true;
        summary = `Inserted new ${isVideo ? 'video' : (savedAssetPath.endsWith('.gif') ? 'animated GIF' : 'image')} panel directly above the selected <${bounds.tagName}>.`;
      }
    }
  }

  // 5. Named Section Scenario: "adjacent to deterministic by design section" (Prompt-based fallback)
  if (!modified && savedAssetPath && (lowerPrompt.includes('deterministic') || lowerPrompt.includes('pipeline'))) {
    const pipeStageRegex = /<div class="pipe-stage[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    if (pipeStageRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(pipeStageRegex, () => {
        return `<div class="pipe-stage reveal" style="display:flex;align-items:center;justify-content:center;background:#0d141c;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        ${mediaTag}
        <span class="tag">SurfaceWare Pipeline</span>
      </div>`;
      });
      modified = true;
      summary = `Replaced the visual graphic adjacent to the 'Deterministic by Design' section on ${targetPage.file} with the new ${isVideo ? 'video' : 'image/GIF'} (${savedAssetPath}).`;
    }
  }

  // 6. Generic Media Insertion Fallback (if user attached media without selecting element)
  if (!modified && savedAssetPath) {
    const wrapRegex = /(<section[^>]*class="[^"]*hero[^"]*"[^>]*>[\s\S]*?<div class="wrap"[^>]*>)/i;
    if (wrapRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(wrapRegex, `$1\n<div class="media-banner-panel">\n  ${mediaTag}\n</div>\n`);
      modified = true;
      summary = `Inserted new ${isVideo ? 'video' : 'image/GIF'} into the hero section of ${targetPage.file}.`;
    }
  }

  // 7. Text Editing: "change the wording at the very top" (Hero headline/kicker)
  if (!modified && (lowerPrompt.includes('very top') || lowerPrompt.includes('headline') || lowerPrompt.includes('hero') || lowerPrompt.includes('wording'))) {
    let newHeadline = null;
    let newKicker = null;

    const quotedMatches = prompt.match(/["“]([^"”]+)["”]/g);
    if (quotedMatches && quotedMatches.length > 0) {
      newHeadline = quotedMatches[0].replace(/["“”]/g, '').trim();
      if (quotedMatches.length > 1) newKicker = quotedMatches[1].replace(/["“”]/g, '').trim();
    } else {
      const afterReflect = prompt.match(/reflect(?:ing)?\s+(?:messaging\s+)?(?:like\s+|as\s+|in\s+)?[:\-]?\s*([A-Za-z0-9\s.,'’—–-]+)/i);
      if (afterReflect) newHeadline = afterReflect[1].trim();
    }

    if (newHeadline) {
      const h1Regex = /<h1 class="h-hero[^"]*"[^>]*>[\s\S]*?<\/h1>/;
      if (h1Regex.test(htmlContent)) {
        htmlContent = htmlContent.replace(h1Regex, `<h1 class="h-hero reveal d1">${newHeadline}</h1>`);
        modified = true;
        summary = `Updated the main hero headline on ${targetPage.file} to: "${newHeadline}".`;
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

  // 8. General Text Replacement via Quotes: "replace X with Y"
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

  // 9. Save Changes
  if (modified) {
    pushUndoSnapshot(targetPage.file, originalContent, htmlContent, summary);
    fs.writeFileSync(targetFilePath, htmlContent, 'utf-8');
  } else {
    summary = `Could not automatically position the new media or locate the text. Please click on the target section in the preview to lock it, select the layout action (Beside, Below, Above, or Replace), and apply.`;
  }

  const gitDiff = getUncommittedDiff();

  return {
    success: modified,
    summary,
    targetPage: targetPage.file,
    pageUrl: targetPage.url,
    diff: gitDiff,
    savedAsset: savedAssetPath,
    isVideo,
    canUndo: canUndo()
  };
}

/**
 * Return uncommitted git diff
 */
function getUncommittedDiff() {
  try {
    return execSync('git diff --stat -p -- *.html styles.css', { cwd: ROOT_DIR, encoding: 'utf-8' });
  } catch (e) {
    return 'No git diff available.';
  }
}

/**
 * Discard uncommitted sandbox website changes (leaves studio code intact)
 */
function revertSandbox() {
  try {
    undoStack.length = 0;
    execSync('git checkout -- *.html styles.css', { cwd: ROOT_DIR });
    return { success: true, message: 'All website sandbox pages have been reverted to pristine git state.', canUndo: false };
  } catch (e) {
    return { success: false, error: e.message, canUndo: false };
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
  saveUploadedAsset,
  processExecutiveEdit,
  processElementResize,
  undoLastChange,
  canUndo,
  getUncommittedDiff,
  revertSandbox,
  publishChanges,
  loadManifest
};
