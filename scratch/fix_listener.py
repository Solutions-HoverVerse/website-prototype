import os

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
        if 'shadow.addEventListener(\'click\'' in code:
            code = code.replace('shadow.addEventListener(\'click\'', 'this.addEventListener(\'click\'')
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(code)
            print(f"Updated addEventListener in: {fpath}")

embed_file = 'wix-assets/wix-home-embed.html'
if os.path.exists(embed_file):
    with open(embed_file, 'r', encoding='utf-8') as f:
        ecode = f.read()
    if 'document.addEventListener(\'click\'' not in ecode:
        ecode = ecode.replace('this.addEventListener(\'click\'', 'document.addEventListener(\'click\'')
        with open(embed_file, 'w', encoding='utf-8') as f:
            f.write(ecode)
