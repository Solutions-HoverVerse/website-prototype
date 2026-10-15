import urllib.request
import re

for slug in ['platform', 'careers']:
    url = f"https://hoververseai.wixstudio.com/my-site/{slug}"
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})).read().decode('utf-8', errors='ignore')
    print(f"=== {slug} ===")
    
    # Search for any mention of custom-elements or hoververse in scripts or JSON
    matches = set(re.findall(r'[^"\'\s<>]*(?:hoververse|careers|platform)[^"\'\s<>]*', html, re.I))
    for m in sorted(matches):
        if any(ext in m for ext in ['.js', '.json', 'public', 'custom']):
            print(" ", m)
