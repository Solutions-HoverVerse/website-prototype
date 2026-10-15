import urllib.request
import re

url = 'https://hoververseai.wixstudio.com/my-site/careers'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# Search for comp-mv81oaf3 (which is the custom element container for careers)
pos = html.find('comp-mv81oaf3')
while pos != -1:
    print(f'=== comp-mv81oaf3 at {pos} ===')
    s = max(0, pos - 150)
    e = min(len(html), pos + 350)
    print(html[s:e])
    pos = html.find('comp-mv81oaf3', pos + 1)
