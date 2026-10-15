import json
import re

with open(r'C:\Users\Jeff\.gemini\antigravity-ide\brain\9d18cf77-be43-4eeb-938d-a09d263ee5b0\.system_generated\steps\586\content.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Look for viewerModel or page JSON
m = re.search(r'id="wix-essential-viewer-model">({.*?})</script>', text)
if m:
    data = json.loads(m.group(1))
    print("Keys in viewerModel:", list(data.keys()))
    if 'pages' in data:
        print("Pages:", data['pages'])
    if 'site' in data:
        print("Site:", data['site'])

# Search for any page names or router config
for m2 in re.finditer(r'"pageId":\s*"([^"]+)"', text):
    print("Found pageId:", m2.group(1))

for m3 in re.finditer(r'"title":\s*"([^"]+)"', text):
    print("Found title:", m3.group(1))

# Check for any URLs or links
matches = re.findall(r'"url":\s*"([^"]+)"', text)
print("Sample URLs found:", matches[:10])
