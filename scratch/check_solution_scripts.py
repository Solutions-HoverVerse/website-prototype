import urllib.request
import re

for slug in ['hover-biosafety', 'hover-living', 'hover-health', 'hover-sr']:
    url = f"https://hoververseai.wixstudio.com/my-site/{slug}"
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
    print(f"=== {slug} ===")
    # Look for script tags or custom element bundle references
    scripts = re.findall(r'https?://[^"\']*(?:custom-elements|hoververse)[^"\']*', html)
    print("Scripts loaded:", set(scripts))
