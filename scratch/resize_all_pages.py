import os

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

header_svg_old = '<svg width="690" height="136" viewBox="0 0 690 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hoververse">'
header_svg_new = '<svg viewBox="0 0 690 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hoververse" class="logo">'

css_additions = '''
        .brand svg, .brand .logo {
          height: 28px !important;
          width: 142px !important;
          max-width: 142px !important;
          aspect-ratio: 690 / 136;
          display: block !important;
          flex: none;
        }
        .footer .brand svg, .footer .brand .logo {
          height: 26px !important;
          width: 132px !important;
          max-width: 132px !important;
          aspect-ratio: 690 / 136;
          display: block !important;
          flex: none;
        }
'''

for d in dirs:
    for fname in page_files:
        fpath = os.path.join(d, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8') as f:
            code = f.read()

        # Replace SVG tags
        code = code.replace(header_svg_old, header_svg_new)

        # Ensure CSS rules for logo sizing are enforced inside the <style>
        if '.brand svg, .brand .logo {' not in code:
            # Insert right before </style>
            code = code.replace('</style>', css_additions + '\n      </style>')

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated page element: {fpath}")

# Also update wix-home-embed.html
embed_file = 'wix-assets/wix-home-embed.html'
if os.path.exists(embed_file):
    with open(embed_file, 'r', encoding='utf-8') as f:
        ecode = f.read()
    ecode = ecode.replace(header_svg_old, header_svg_new)
    if '.brand svg, .brand .logo {' not in ecode:
        ecode = ecode.replace('</style>', css_additions + '\n</style>')
    with open(embed_file, 'w', encoding='utf-8') as f:
        f.write(ecode)
    print(f"Updated embed file: {embed_file}")

print("All elements updated with resized logo rules.")
