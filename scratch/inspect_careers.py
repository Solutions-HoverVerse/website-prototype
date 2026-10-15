import urllib.request
import re

url = 'https://hoververseai.wixstudio.com/my-site/careers'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

print('Length of careers HTML:', len(html))

# Look for custom element tags
for m in re.finditer(r'<[a-z0-9_-]*(?:custom-element|hoververse|hover|bio|living|career)[^>]*>', html, re.I):
    print('Tag:', m.group(0))

# Look for script bundles loaded on careers
for s in re.findall(r'https?://[^"\'\s]*(?:custom-elements|hoververse|careers)[^"\'\s]*', html):
    print('Script:', s)
