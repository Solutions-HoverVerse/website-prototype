with open(r'C:\Users\Jeff\.gemini\antigravity-ide\brain\9d18cf77-be43-4eeb-938d-a09d263ee5b0\.system_generated\steps\586\content.md', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find the entire pages dictionary
start = text.find('"pages":{')
if start != -1:
    depth = 0
    end = start + 8
    for i in range(start + 8, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    pages_block = text[start:end]
    print(pages_block)
