import urllib.request
import re

url = 'https://hoververseai.wixstudio.com/my-site/hover-health'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

print("Length:", len(html))
for m in re.finditer(r'data-testid="custom-element"', html):
    s = max(0, m.start() - 150)
    e = min(len(html), m.end() + 300)
    print(html[s:e])
    print('=' * 40)

# Check all tags starting with hoververse
for m in re.finditer(r'<hoververse-[a-z-]+', html):
    s = max(0, m.start() - 50)
    e = min(len(html), m.end() + 100)
    print("Found tag:", html[s:e])
