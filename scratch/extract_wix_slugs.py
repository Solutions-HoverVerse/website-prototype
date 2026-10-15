with open(r'C:\Users\Jeff\.gemini\antigravity-ide\brain\9d18cf77-be43-4eeb-938d-a09d263ee5b0\.system_generated\steps\586\content.md', 'r', encoding='utf-8') as f:
    text = f.read()

import re
import json

# Find the pages map
m = re.search(r'"pages":({.*?"pageUriSEO".*?})', text)
if m:
    print("Found pages map block!")

# Find all pageId, title, pageUriSEO
pattern = r'\{"pageId":"([^"]+)","title":"([^"]+)","pageUriSEO":"([^"]+)"'
for p in re.finditer(pattern, text):
    print(f"Page ID: {p.group(1)} | Title: {p.group(2):20} | URL Slug: '{p.group(3)}'")
