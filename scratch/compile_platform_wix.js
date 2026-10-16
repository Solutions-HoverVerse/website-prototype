const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WIX_REPO = path.join(ROOT_DIR, 'wix-repo');

const cdnPrefix = 'https://raw.githubusercontent.com/Solutions-HoverVerse/website-prototype/main/';

const publicPath = path.join(WIX_REPO, 'src', 'public', 'hoververse-platform.js');
const cePath = path.join(WIX_REPO, 'src', 'public', 'custom-elements', 'hoververse-platform.js');

let code = fs.readFileSync(publicPath, 'utf-8');

// 1. Add split media styles if not present
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

if (!code.includes('split-media-grid')) {
  code = code.replace('</style>', `${studioStyles}\n</style>`);
  console.log('Added split-media-grid styles to shadow style');
}

// 2. Update Hero section
const oldHeroHead = `<div class="sec-head reveal" style="max-width:900px">
      <span class="crumb">Hoververse / Platform</span>
      <h1 class="h-1">One platform. Three layers.</h1>
      <p class="lead">SurfaceWare™ senses the gesture. Hover OS renders the experience. SurfaceWare Central manages the fleet. Together, they're Hoververse's alternative to the mouse, keyboard and touchscreen GUI — the <b>SurfaceWare UI (SUI)</b>.</p>
    </div>`;

const newHeroHead = `<div class="sec-head reveal" style="max-width:1160px">
      <span class="crumb">Hoververse / Platform</span>
      
<div class="split-media-grid align-center">
  <div class="split-text-col">
    <h1 class="h-1">One platform. Three layers.</h1>
      <p class="lead">SurfaceWare™ senses the gesture. Hover OS renders the experience. SurfaceWare Central manages the fleet. Together, they're Hoververse's alternative to the mouse, keyboard and touchscreen GUI — the <b>SurfaceWare UI (SUI)</b>.</p>
  </div>
  <div class="split-media-col ratio-1-1" style="aspect-ratio:1 / 1;">
    <img src="${cdnPrefix}assets/uploads/exec_1792077244656_Hover_OS_diagram.jpeg" alt="Hoververse interactive visual" style="width:100%;height:auto;aspect-ratio:1 / 1;object-fit:contain;display:block;border-radius:16px;" loading="lazy" />
  </div>
</div>
    </div>`;

if (code.includes(oldHeroHead)) {
  code = code.replace(oldHeroHead, newHeroHead);
  console.log('Successfully updated Hero section in hoververse-platform.js');
} else {
  console.log('Could not find exact oldHeroHead string, checking normalized...');
  // Normalize whitespace match
  const heroRegex = /<div class="sec-head reveal"[^>]*>\s*<span class="crumb">Hoververse \/ Platform<\/span>\s*<h1 class="h-1">One platform\. Three layers\.<\/h1>\s*<p class="lead">SurfaceWare™ senses the gesture[\s\S]*?<\/p>\s*<\/div>/;
  if (heroRegex.test(code)) {
    code = code.replace(heroRegex, newHeroHead);
    console.log('Replaced normalized Hero section');
  } else {
    console.error('FAILED to match Hero section');
  }
}

// 3. Update Hover OS section: Add Aim-hold-commit.jpg card above terminal box
const termBox = `<div style="border-radius:var(--r-xl);border:1px solid var(--line);overflow:hidden;background:var(--dark);box-shadow:0 30px 70px -42px rgba(16,21,27,.6)">`;

const aimHoldCard = `<!-- Aim, Hold, Commit Natural Interaction Visual -->
        <div style="border-radius:var(--r-xl);border:1px solid var(--line);overflow:hidden;background:var(--dark);box-shadow:0 24px 60px -35px rgba(16,21,27,.4);margin-bottom:24px;">
          <img src="${cdnPrefix}assets/uploads/exec_1792077036365_Aim-hold-commit.jpg" alt="Aim, Hold, Commit Gesture Interaction Model" style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;display:block;" loading="lazy" />
        </div>
        `;

if (!code.includes('Aim-hold-commit.jpg')) {
  if (code.includes(termBox)) {
    code = code.replace(termBox, aimHoldCard + termBox);
    console.log('Successfully added Aim-hold-commit.jpg card above terminal in hoververse-platform.js');
  } else {
    console.error('FAILED to find termBox in hoververse-platform.js');
  }
}

// 4. Update any remaining relative assets in hoververse-platform.js to CDN
code = code.replace(/src="assets\/([^"]+)"/g, `src="${cdnPrefix}assets/$1"`);
code = code.replace(/src='assets\/([^']+)'/g, `src='${cdnPrefix}assets/$1'`);

// 5. Write back to both files
fs.writeFileSync(publicPath, code, 'utf-8');
fs.writeFileSync(cePath, code, 'utf-8');
console.log('Updated both hoververse-platform.js files successfully!');
