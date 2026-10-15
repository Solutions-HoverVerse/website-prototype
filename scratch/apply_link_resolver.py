import os

resolver_snippet = '''
    // Dynamic link resolver: ensures navigation works on both Wix test subpaths (/my-site/...) and production custom domains (/)
    const knownPages = new Set([
      '', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
      'hover-health', 'biosafety', 'living-heritage', 'hover-sr',
      'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
    ]);
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const sitePrefix = (pathParts.length > 0 && !knownPages.has(pathParts[0])) ? '/' + pathParts[0] : '';
    if (sitePrefix) {
      shadow.querySelectorAll('a[href^="/"]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href.startsWith(sitePrefix + '/') && href !== sitePrefix) {
          if (href === '/') {
            a.setAttribute('href', sitePrefix);
          } else {
            a.setAttribute('href', sitePrefix + href);
          }
        }
      });
    }
'''

# 1. Update hoververse-header.js
header_files = [
    'wix-repo/src/public/hoververse-header.js',
    'wix-repo/src/public/custom-elements/hoververse-header.js'
]
for hf in header_files:
    if not os.path.exists(hf):
        continue
    with open(hf, 'r', encoding='utf-8') as f:
        code = f.read()
    if 'Dynamic link resolver' not in code:
        marker = 'const demoBtn = shadow.querySelector(\'.demo-btn\');'
        if marker in code:
            code = code.replace(marker, marker + '\n' + resolver_snippet)
            with open(hf, 'w', encoding='utf-8') as f:
                f.write(code)
            print(f"Added link resolver to: {hf}")

# 2. Update hoververse-footer.js
footer_files = [
    'wix-repo/src/public/hoververse-footer.js',
    'wix-repo/src/public/custom-elements/hoververse-footer.js'
]
for ff in footer_files:
    if not os.path.exists(ff):
        continue
    with open(ff, 'r', encoding='utf-8') as f:
        code = f.read()
    if 'Dynamic link resolver' not in code:
        marker = 'if (yr) yr.textContent = new Date().getFullYear();'
        if marker in code:
            code = code.replace(marker, marker + '\n' + resolver_snippet)
            with open(ff, 'w', encoding='utf-8') as f:
                f.write(code)
            print(f"Added link resolver to: {ff}")

# 3. Update all 15 page custom elements
page_files = [
    'hoververse-about.js',
    'hoververse-biosafety.js',
    'hoververse-careers.js',
    'hoververse-home.js',
    'hoververse-hover-health.js',
    'hoververse-hover-sr.js',
    'hoververse-investors.js',
    'hoververse-leadership.js',
    'hoververse-living-heritage.js',
    'hoververse-platform.js',
    'hoververse-privacy-policy.js',
    'hoververse-resources.js',
    'hoververse-solutions.js',
    'hoververse-terms-of-service.js',
    'hoververse-why-hoververse.js'
]
dirs = ['wix-repo/src/public', 'wix-repo/src/public/custom-elements']
for d in dirs:
    for fname in page_files:
        fpath = os.path.join(d, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8') as f:
            code = f.read()
        if 'Dynamic link resolver' not in code:
            marker = 'if (yr) yr.textContent = new Date().getFullYear();'
            if marker in code:
                code = code.replace(marker, marker + '\n' + resolver_snippet)
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(code)
                print(f"Added link resolver to: {fpath}")

# 4. Update wix-home-embed.html
embed_file = 'wix-assets/wix-home-embed.html'
if os.path.exists(embed_file):
    with open(embed_file, 'r', encoding='utf-8') as f:
        ecode = f.read()
    if 'Dynamic link resolver' not in ecode:
        embed_resolver = resolver_snippet.replace('shadow.', 'document.')
        marker = 'if (yr) yr.textContent = new Date().getFullYear();'
        if marker in ecode:
            ecode = ecode.replace(marker, marker + '\n' + embed_resolver)
            with open(embed_file, 'w', encoding='utf-8') as f:
                f.write(ecode)
            print(f"Added link resolver to: {embed_file}")

print("Link resolver deployed across all components.")
