import urllib.request
import re

for slug in ['', 'careers', 'platform', 'about']:
    url = f'https://hoververseai.wixstudio.com/my-site/{slug}' if slug else 'https://hoververseai.wixstudio.com/my-site'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

    matches = list(re.finditer(r'data-testid="custom-element"', html))
    print(f'=== {url} ===: Total custom-elements: {len(matches)}')
    for i, m in enumerate(matches):
        tag_match = re.search(r'<([a-z0-9_-]+)[^>]*>', html[m.start():m.end() + 200])
        tag = tag_match.group(1) if tag_match else 'unknown'
        # Check if inside footer
        in_footer = 'footer' in html[max(0, m.start()-300):m.start()]
        print(f'  Element {i+1}: <{tag}> | in_footer={in_footer}')
