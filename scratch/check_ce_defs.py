import urllib.request
import re
import json

for slug in ['hover-biosafety', 'hover-living']:
    url = f"https://hoververseai.wixstudio.com/my-site/{slug}"
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
    print(f"=== {slug} ===")
    # Find custom element definitions in JSON
    for m in re.finditer(r'\{[^{}]*"tagName"\s*:\s*"([^"]+)"[^{}]*\}', html):
        print("  Custom element def:", m.group(0))
    for m in re.finditer(r'"customElementSource"\s*:\s*"([^"]+)"', html):
        print("  customElementSource:", m.group(1))
