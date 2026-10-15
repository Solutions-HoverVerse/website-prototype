import urllib.request
import re

url = 'https://hoververseai.wixstudio.com/my-site/about'
html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')

# Search for any references to .js files on filesusr.com or static.parastorage.com
for m in re.finditer(r'https://[^"\'\s]+\.js[^"\'\s]*', html):
    js_url = m.group(0)
    if any(k in js_url for k in ['hoververse', 'custom', 'about', 'public', 'velo', 'filesusr']):
        print('JS URL:', js_url)

# Search for customElementSource in JSON or window object
for m in re.finditer(r'"url"\s*:\s*"([^"]+)"', html):
    u = m.group(1)
    if 'hoververse' in u:
        print('Element URL:', u)
