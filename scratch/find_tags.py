import urllib.request
import re

url = 'https://hoververseai.wixstudio.com/my-site/platform'
html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')

for m in re.finditer(r'<hoververse-[a-z0-9_-]+', html):
    s = max(0, m.start() - 100)
    e = min(len(html), m.end() + 100)
    print("Match at", m.start(), ":")
    print(html[s:e])
    print("=" * 40)
