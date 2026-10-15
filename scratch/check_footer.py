import urllib.request

url = 'https://hoververseai.wixstudio.com/my-site/platform'
html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')

footer_idx = html.find('comp-mulo9ghd')
if footer_idx != -1:
    print('Found footer:')
    print(html[footer_idx-50:footer_idx+600])
else:
    print('Footer not found')
