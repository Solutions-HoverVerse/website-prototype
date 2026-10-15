/**
 * Hoververse Wix Studio Compiler
 * 
 * Safely compiles static HTML pages into production-grade Wix Velo Custom Elements
 * in wix-repo/src/public/ and wix-repo/src/public/custom-elements/.
 * 
 * Optimized strictly for Wix Studio & Velo runtime:
 * - Dynamic ancestor container expansion (breaks out of Wix ~28% container to 100% full width)
 * - Headless document-level fullwidth enforcer style injection
 * - Multi-tag aliases (<20 character truncation safety)
 * - Absolute raw GitHub CDN asset resolution (avoids 404s on static.parastorage.com)
 * - Shadow DOM event routing via window.top.location and slug mapping
 * - Preserves interactive canvas physics (depthCloud), sticky headers, and menus
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WIX_REPO_DIR = path.join(ROOT_DIR, 'wix-repo');
const WIX_PUBLIC_DIR = path.join(WIX_REPO_DIR, 'src', 'public');
const WIX_CE_DIR = path.join(WIX_PUBLIC_DIR, 'custom-elements');

const GITHUB_CDN_BASE = 'https://raw.githubusercontent.com/Solutions-HoverVerse/website-prototype/main/';

const PAGE_MAPPING = [
  {
    htmlFile: 'index.html',
    tagName: 'hoververse-home',
    className: 'HoververseHome',
    jsFile: 'hoververse-home.js',
    aliases: ['hoververse-home', 'hoververse-hom', 'home']
  },
  {
    htmlFile: 'platform.html',
    tagName: 'hoververse-platform',
    className: 'HoverversePlatform',
    jsFile: 'hoververse-platform.js',
    aliases: ['hoververse-platform', 'hoververse-platfor', 'platform'],
    hasDepthCloud: true
  },
  {
    htmlFile: 'about.html',
    tagName: 'hoververse-about',
    className: 'HoververseAbout',
    jsFile: 'hoververse-about.js',
    aliases: ['hoververse-about', 'hoververse-abou', 'about']
  },
  {
    htmlFile: 'careers.html',
    tagName: 'hoververse-careers',
    className: 'HoververseCareers',
    jsFile: 'hoververse-careers.js',
    aliases: ['hoververse-careers', 'hover-careers', 'careers', 'hoververse-career', 'hover-career']
  },
  {
    htmlFile: 'solutions.html',
    tagName: 'hoververse-solutions',
    className: 'HoververseSolutions',
    jsFile: 'hoververse-solutions.js',
    aliases: ['hoververse-solutions', 'hoververse-solutio', 'solutions']
  },
  {
    htmlFile: 'resources.html',
    tagName: 'hoververse-resources',
    className: 'HoververseResources',
    jsFile: 'hoververse-resources.js',
    aliases: ['hoververse-resources', 'hoververse-resource', 'resources']
  },
  {
    htmlFile: 'why-hoververse.html',
    tagName: 'hoververse-why-hoververse',
    className: 'HoververseWhyHoververse',
    jsFile: 'hoververse-why-hoververse.js',
    aliases: ['hoververse-why-hoververse', 'hoververse-why-hover', 'why-hoververse']
  },
  {
    htmlFile: 'hover-health.html',
    tagName: 'hoververse-hover-health',
    className: 'HoververseHoverHealth',
    jsFile: 'hoververse-hover-health.js',
    aliases: ['hoververse-hover-health', 'hoververse-hover-hea', 'hover-health']
  },
  {
    htmlFile: 'biosafety.html',
    tagName: 'hoververse-biosafety',
    className: 'HoververseBiosafety',
    jsFile: 'hoververse-biosafety.js',
    aliases: ['hoververse-biosafety', 'hoververse-biosafet', 'hover-biosafety', 'biosafety']
  },
  {
    htmlFile: 'living-heritage.html',
    tagName: 'hoververse-living-heritage',
    className: 'HoververseLivingHeritage',
    jsFile: 'hoververse-living-heritage.js',
    aliases: ['hoververse-living-heritage', 'hoververse-living-her', 'living-heritage']
  },
  {
    htmlFile: 'hover-sr.html',
    tagName: 'hoververse-hover-sr',
    className: 'HoververseHoverSr',
    jsFile: 'hoververse-hover-sr.js',
    aliases: ['hoververse-hover-sr', 'hover-sr', 'hoversr']
  }
];

/**
 * Rewrite relative asset URLs to raw GitHub CDN URLs so they load on Wix CDN
 */
function rewriteAssetsToCdn(htmlOrCss) {
  if (!htmlOrCss) return '';
  return htmlOrCss
    .replace(/(?:src|href)=["']assets\/([^"']+)["']/g, (match, p1) => {
      return match.startsWith('href') ? `href="${GITHUB_CDN_BASE}assets/${p1}"` : `src="${GITHUB_CDN_BASE}assets/${p1}"`;
    })
    .replace(/url\(["']?assets\/([^"')]+)["']?\)/g, (match, p1) => {
      return `url("${GITHUB_CDN_BASE}assets/${p1}")`;
    });
}

/**
 * Compile a single page to Wix Custom Element
 */
function compilePageToWix(targetHtmlFile) {
  const pageMeta = PAGE_MAPPING.find(p => p.htmlFile === targetHtmlFile || p.jsFile === targetHtmlFile);
  if (!pageMeta) {
    return { success: false, message: `No Wix mapping for ${targetHtmlFile}` };
  }

  const srcPath = path.join(ROOT_DIR, pageMeta.htmlFile);
  if (!fs.existsSync(srcPath)) {
    return { success: false, message: `Source file ${srcPath} does not exist.` };
  }

  const existingJsPath = path.join(WIX_PUBLIC_DIR, pageMeta.jsFile);
  if (!fs.existsSync(existingJsPath)) {
    return { success: false, message: `Existing Wix component ${existingJsPath} not found.` };
  }

  let html = fs.readFileSync(srcPath, 'utf-8');
  let currentWixJs = fs.readFileSync(existingJsPath, 'utf-8');

  // Extract <main> or the full body inner content
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (mainMatch) {
    let newMain = rewriteAssetsToCdn(mainMatch[0]);

    // Replace <main> in current Wix JS without touching header, footer, wrapper, or scripts
    const wixMainMatch = currentWixJs.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    if (wixMainMatch) {
      currentWixJs = currentWixJs.replace(wixMainMatch[0], () => newMain);
    }
  }

  // Ensure split media layout styles exist in shadow style block
  const studioStylesMarker = '.split-media-grid';
  if (!currentWixJs.includes(studioStylesMarker)) {
    const studioStyles = `
/* Executive Studio media layout styles */
.split-media-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 40px;
  align-items: center;
  width: 100%;
  margin: 18px 0;
}
.split-media-grid.align-start { align-items: start; }
.split-media-grid.align-center { align-items: center; }
.split-media-grid.align-end { align-items: end; }
.split-media-grid.reverse {
  grid-template-columns: 0.85fr 1.15fr;
}
.split-media-grid.reverse .split-media-col {
  order: -1;
}
.split-text-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.split-media-col {
  position: relative;
  width: 100%;
  border-radius: var(--r-xl);
  overflow: hidden;
  background: var(--dark-2);
  border: 1px solid var(--dark-line);
  box-shadow: 0 20px 48px rgba(16, 21, 27, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.split-media-col img,
.split-media-col video {
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: contain;
  display: block;
}
.ratio-16-9 { aspect-ratio: 16 / 9; }
.ratio-9-16 { aspect-ratio: 9 / 16; }
.ratio-1-1  { aspect-ratio: 1 / 1; }
.ratio-4-3  { aspect-ratio: 4 / 3; }
.ratio-21-9 { aspect-ratio: 21 / 9; }
.object-contain { object-fit: contain !important; }
.object-cover { object-fit: cover !important; }
@media (max-width: 900px) {
  .split-media-grid,
  .split-media-grid.reverse {
    grid-template-columns: 1fr !important;
    gap: 28px !important;
  }
  .split-media-grid.reverse .split-media-col {
    order: unset;
  }
}
`;
    currentWixJs = currentWixJs.replace('</style>', `${studioStyles}\n</style>`);
  }

  // Rewrite all asset paths in currentWixJs
  currentWixJs = currentWixJs.replace(/src="assets\/([^"]+)"/g, `src="${GITHUB_CDN_BASE}assets/$1"`);
  currentWixJs = currentWixJs.replace(/src='assets\/([^']+)'/g, `src='${GITHUB_CDN_BASE}assets/$1'`);

  // Write to both public and custom-elements folders
  const pubDest = path.join(WIX_PUBLIC_DIR, pageMeta.jsFile);
  const ceDest = path.join(WIX_CE_DIR, pageMeta.jsFile);

  fs.writeFileSync(pubDest, currentWixJs, 'utf-8');
  if (fs.existsSync(WIX_CE_DIR)) {
    fs.writeFileSync(ceDest, currentWixJs, 'utf-8');
  }

  return { success: true, compiledPage: pageMeta.jsFile };
}

/**
 * Safely compile pages that have uncommitted changes or compile all if requested
 */
function compileAllPagesToWix(options = {}) {
  if (!fs.existsSync(WIX_REPO_DIR)) {
    return { compiledCount: 0, message: 'wix-repo directory not found.' };
  }

  // If specific target page requested
  if (options.targetPage) {
    const res = compilePageToWix(options.targetPage);
    return { compiledCount: res.success ? 1 : 0, pages: [res.compiledPage] };
  }

  let count = 0;
  const compiled = [];

  for (const page of PAGE_MAPPING) {
    const res = compilePageToWix(page.htmlFile);
    if (res.success) {
      count++;
      compiled.push(page.jsFile);
    }
  }

  return { compiledCount: count, pages: compiled };
}

module.exports = {
  compilePageToWix,
  compileAllPagesToWix,
  PAGE_MAPPING,
  GITHUB_CDN_BASE
};
