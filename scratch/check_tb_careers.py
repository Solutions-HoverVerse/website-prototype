import urllib.request
import re
import json

# URL of thunderbolt features for careers page
url = 'https://siteassets.parastorage.com/pages/pages/thunderbolt?blocksBuilderManifestGeneratorVersion=1.129.0&contentType=application%2Fjson&deviceType=Other&dfCk=6&dfVersion=1.5650.0&disableStaticPagesUrlHierarchy=false&editorName=Studio&externalBaseUrl=https%3A%2F%2Fhoververseai.wixstudio.com%2Fmy-site&fileId=bb7d9a57.bundle.min&formFactor=desktop&language=en&metaSiteId=a11c813a-d41e-4534-9bfa-8bc839fcc6f7&module=thunderbolt-features&originalLanguage=en&pageId=50e042_3505278366ce5a1fe3a42c234cb2729e_79.json&siteId=ee924909-2b7e-4887-b7f2-399ee2b74651&siteRevision=81&viewMode=desktop'

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    print('Content len:', len(content))
    # Find any customElement properties
    for m in re.finditer(r'\{[^{}]*customElement[^{}]*\}', content, re.I):
        print(m.group(0))
except Exception as e:
    print('Error:', e)
