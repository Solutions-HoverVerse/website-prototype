import urllib.request
import re
import json

url = 'https://hoververseai.wixstudio.com/my-site'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# Extract router pages
pages = set()
for m in re.finditer(r'"pageUriSEO"\s*:\s*"([^"]+)"', html):
    pages.add(m.group(1))

for m in re.finditer(r'"relativeUrl"\s*:\s*"([^"]+)"', html):
    pages.add(m.group(1))

print("Pages found in site model:")
for p in sorted(pages):
    print(" ", p)

# Search for any page title or link containing bio or heritage
print("\nTitles/labels found:")
for m in re.finditer(r'"title"\s*:\s*"([^"]+)"', html):
    t = m.group(1)
    if any(k in t.lower() for k in ['health', 'bio', 'heritage', 'retail', 'sr', 'solution']):
        print(" ", t)
