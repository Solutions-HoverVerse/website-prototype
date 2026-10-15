import urllib.request
import re

url = 'https://hoververseai.wixstudio.com/my-site/about'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

print('Length of about html:', len(html))

print('\nCustom element defs in JSON:')
for m in re.finditer(r'\{[^{}]*"tagName"[^{}]*\}', html):
    print(' ', m.group(0))

print('\ncustomElementSource:')
for m in re.finditer(r'"customElementSource"\s*:\s*"([^"]+)"', html):
    print(' ', m.group(1))

print('\nTags found:')
for m in re.finditer(r'<([a-z0-9_-]*(?:custom-element|hoververse|hover|bio|living|about)[a-z0-9_-]*)', html, re.I):
    print(' ', m.group(1))
