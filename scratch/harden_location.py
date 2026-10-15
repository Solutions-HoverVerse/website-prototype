import os

old_line = "const pathParts = window.location.pathname.split('/').filter(Boolean);"
new_line = "const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';\n    const pathParts = pathname.split('/').filter(Boolean);"

dirs = ['wix-repo/src/public', 'wix-repo/src/public/custom-elements']
all_files = [
    'hoververse-header.js',
    'hoververse-footer.js',
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

for d in dirs:
    for fname in all_files:
        fpath = os.path.join(d, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8') as f:
            code = f.read()
        if old_line in code:
            code = code.replace(old_line, new_line)
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(code)
            print(f"Hardened window.location in: {fpath}")

embed_file = 'wix-assets/wix-home-embed.html'
if os.path.exists(embed_file):
    with open(embed_file, 'r', encoding='utf-8') as f:
        ecode = f.read()
    if old_line in ecode:
        ecode = ecode.replace(old_line, new_line)
        with open(embed_file, 'w', encoding='utf-8') as f:
            f.write(ecode)
        print(f"Hardened window.location in: {embed_file}")
