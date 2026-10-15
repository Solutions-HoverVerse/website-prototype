import urllib.request
import re

base = 'https://hoververseai.wixstudio.com/my-site'
pages = [
    ('', 'Home'),
    ('platform', 'Platform'),
    ('solutions', 'Solutions'),
    ('why-hoververse', 'Why Hoververse'),
    ('resources', 'Resources'),
    ('about', 'About'),
    ('hover-health', 'Hover Health'),
    ('hover-biosafety', 'Hover Biosafety'),
    ('hover-living', 'Hover Living'),
    ('hover-sr', 'Hover SR')
]

for slug, name in pages:
    url = f"{base}/{slug}" if slug else base
    try:
        html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
        # Find all custom elements
        tags = set(re.findall(r'<([a-z0-9_-]*(?:custom-element|hoververse|hover|bio|living)[a-z0-9_-]*)', html, re.I))
        # Filter out closing tags and noise
        tags = [t for t in tags if not t.startswith('/') and t not in ['hoververseai']]
        print(f"{name:18} (slug: /{slug or ''}): HTTP 200 | tags: {tags}")
    except Exception as e:
        print(f"{name:18} (slug: /{slug or ''}): Error {e}")
