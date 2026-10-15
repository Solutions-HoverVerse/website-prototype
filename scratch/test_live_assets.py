import urllib.request
import re

try:
    req = urllib.request.Request('https://www.hoververse.ai', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    assets = set(re.findall(r'assets/[^\s"\'<>]+', html))
    print("Found assets:")
    for a in sorted(assets):
        print(" ", a)
except Exception as e:
    print("Error:", e)
