import os
import re

new_nav_logic = '''
    // Wix Custom Element Navigation & Subpath Resolver
    let currentPath = '';
    try {
      if (window.top && window.top.location && window.top.location.pathname) {
        currentPath = window.top.location.pathname;
      }
    } catch (e) {
      if (document.referrer) {
        try { currentPath = new URL(document.referrer).pathname; } catch (err) {}
      }
    }
    if (!currentPath && typeof window !== 'undefined' && window.location) {
      currentPath = window.location.pathname || '';
    }

    const knownPages = new Set([
      '', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
      'hover-health', 'biosafety', 'living-heritage', 'hover-sr',
      'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
    ]);
    const pathParts = currentPath.split('/').filter(Boolean);
    const sitePrefix = (pathParts.length > 0 && !knownPages.has(pathParts[0])) ? '/' + pathParts[0] : '';

    // Enforce target="_top" (required by Wix custom element sandbox) & resolve subpaths
    shadow.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        // Ensure external links open cleanly
        if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
        return;
      }
      if (href.startsWith('#')) return;

      // Break out of Wix custom element sandbox to top-level window
      a.setAttribute('target', '_top');

      // Adjust relative prefix for staging subpaths
      if (sitePrefix && href.startsWith('/')) {
        if (!href.startsWith(sitePrefix + '/') && href !== sitePrefix) {
          if (href === '/') {
            a.setAttribute('href', sitePrefix);
          } else {
            a.setAttribute('href', sitePrefix + href);
          }
        }
      }
    });

    // Programmatic top-window navigation fallback for all internal links
    shadow.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.getAttribute('target') === '_blank') return;
      if (a.hostname && a.hostname !== window.location.hostname && a.hostname !== (window.top ? window.top.location.hostname : '')) return;

      e.preventDefault();
      const targetUrl = a.href;
      try {
        if (window.top && window.top.location) {
          window.top.location.href = targetUrl;
          return;
        }
      } catch (err) {}
      window.location.href = targetUrl;
    });
'''

# List of files to update
files_to_update = [
    'wix-repo/src/public/hoververse-header.js',
    'wix-repo/src/public/custom-elements/hoververse-header.js',
    'wix-repo/src/public/hoververse-footer.js',
    'wix-repo/src/public/custom-elements/hoververse-footer.js',
    'wix-repo/src/public/hoververse-about.js',
    'wix-repo/src/public/hoververse-biosafety.js',
    'wix-repo/src/public/hoververse-careers.js',
    'wix-repo/src/public/hoververse-home.js',
    'wix-repo/src/public/hoververse-hover-health.js',
    'wix-repo/src/public/hoververse-hover-sr.js',
    'wix-repo/src/public/hoververse-investors.js',
    'wix-repo/src/public/hoververse-leadership.js',
    'wix-repo/src/public/hoververse-living-heritage.js',
    'wix-repo/src/public/hoververse-platform.js',
    'wix-repo/src/public/hoververse-privacy-policy.js',
    'wix-repo/src/public/hoververse-resources.js',
    'wix-repo/src/public/hoververse-solutions.js',
    'wix-repo/src/public/hoververse-terms-of-service.js',
    'wix-repo/src/public/hoververse-why-hoververse.js',
    'wix-repo/src/public/custom-elements/hoververse-about.js',
    'wix-repo/src/public/custom-elements/hoververse-biosafety.js',
    'wix-repo/src/public/custom-elements/hoververse-careers.js',
    'wix-repo/src/public/custom-elements/hoververse-home.js',
    'wix-repo/src/public/custom-elements/hoververse-hover-health.js',
    'wix-repo/src/public/custom-elements/hoververse-hover-sr.js',
    'wix-repo/src/public/custom-elements/hoververse-investors.js',
    'wix-repo/src/public/custom-elements/hoververse-leadership.js',
    'wix-repo/src/public/custom-elements/hoververse-living-heritage.js',
    'wix-repo/src/public/custom-elements/hoververse-platform.js',
    'wix-repo/src/public/custom-elements/hoververse-privacy-policy.js',
    'wix-repo/src/public/custom-elements/hoververse-resources.js',
    'wix-repo/src/public/custom-elements/hoververse-solutions.js',
    'wix-repo/src/public/custom-elements/hoververse-terms-of-service.js',
    'wix-repo/src/public/custom-elements/hoververse-why-hoververse.js'
]

# Pattern to replace existing Dynamic link resolver block
old_pattern = re.compile(r"// Dynamic link resolver:.*?\}\);\n    \}", re.DOTALL)

for fpath in files_to_update:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        code = f.read()

    if old_pattern.search(code):
        code = old_pattern.sub(new_nav_logic.strip(), code)
    elif '// Wix Custom Element Navigation & Subpath Resolver' not in code:
        # Fallback insertion
        marker = 'if (yr) yr.textContent = new Date().getFullYear();'
        if marker in code:
            code = code.replace(marker, marker + '\n' + new_nav_logic)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Updated navigation logic in: {fpath}")

# Update wix-home-embed.html
embed_file = 'wix-assets/wix-home-embed.html'
if os.path.exists(embed_file):
    with open(embed_file, 'r', encoding='utf-8') as f:
        ecode = f.read()
    embed_nav_logic = new_nav_logic.replace('shadow.', 'document.').replace('shadow.addEventListener', 'document.addEventListener')
    if old_pattern.search(ecode):
        ecode = old_pattern.sub(embed_nav_logic.strip(), ecode)
    with open(embed_file, 'w', encoding='utf-8') as f:
        f.write(ecode)
    print(f"Updated embed file: {embed_file}")

print("Navigation overhaul complete.")
