import urllib.request
import re

for slug in ['careers', 'hover-biosafety', '']:
    url = f"https://hoververseai.wixstudio.com/my-site/{slug}" if slug else "https://hoververseai.wixstudio.com/my-site"
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
    print(f"=== {slug or 'HOME'} ===")
    for m in re.finditer(r'\{[^{}]*"tagName"\s*:\s*"([^"]+)"[^{}]*\}', html):
        print("  Custom element def:", m.group(0))
    for m in re.finditer(r'"customElementSource"\s*:\s*"([^"]+)"', html):
        print("  customElementSource:", m.group(1))
