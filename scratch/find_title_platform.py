with open(r'C:\Users\Jeff\.gemini\antigravity-ide\brain\9d18cf77-be43-4eeb-938d-a09d263ee5b0\.system_generated\steps\586\content.md', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'"title":\s*"Platform"', text):
    start = max(0, m.start() - 250)
    end = min(len(text), m.end() + 250)
    print("--- CONTEXT FOR TITLE PLATFORM ---")
    print(text[start:end])
    print("---------------------------------")
