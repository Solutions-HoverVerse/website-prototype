import urllib.request
import re

url = 'https://hoververseai.wixstudio.com/my-site/careers'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

print("Searching for customElement definitions...")
for m in re.finditer(r'\{[^{}]*"tagName"\s*:\s*"([^"]+)"[^{}]*\}', html):
    print(" ", m.group(0))

for m in re.finditer(r'"customElementSource"\s*:\s*"([^"]+)"', html):
    print("  customElementSource:", m.group(1))

for m in re.finditer(r'"source"\s*:\s*"([^"]+)"', html):
    if 'hoververse' in m.group(1):
        print("  source:", m.group(1))
