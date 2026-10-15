import os
import re

dirs = ['wix-repo/src/public', 'wix-repo/src/public/custom-elements']

page_files = [
    'hoververse-about.js',
    'hoververse-biosafety.js',
    'hoververse-careers.js',
    'hoververse-home.js',
    'hoververse-hover-health.js',
    'hoververse-hover-sr.js',
    'hoververse-investors.js',
    'hoververse-leadership.js',
    'hoververse-living-heritage.js',
    'hoververse-platform.js',
    'hoververse-privacy-policy.js',
    'hoververse-resources.js',
    'hoververse-solutions.js',
    'hoververse-terms-of-service.js',
    'hoververse-why-hoververse.js',
    'hoververse-header.js',
    'hoververse-footer.js',
    'hoververse-field.js',
    'hoververse-depthcloud.js',
    'hoververse-investors-gate.js'
]

for d in dirs:
    for fname in page_files:
        fpath = os.path.join(d, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Guard 1: if (this.shadowRoot) return;
        if 'if (this.shadowRoot) return;' not in content:
            content = content.replace(
                'connectedCallback() {\n    const shadow = this.attachShadow',
                'connectedCallback() {\n    if (this.shadowRoot) return;\n    const shadow = this.attachShadow'
            )
            content = content.replace(
                'connectedCallback() {\n  const shadow = this.attachShadow',
                'connectedCallback() {\n  if (this.shadowRoot) return;\n  const shadow = this.attachShadow'
            )

        # Guard 2: if (!customElements.get('TAG'))
        pattern = r"\ncustomElements\.define\('([^']+)',\s*([^)]+)\);"
        matches = list(re.finditer(pattern, content))
        for m in reversed(matches):
            tag = m.group(1)
            cls = m.group(2)
            check_str = f"if (!customElements.get('{tag}'))"
            # check if check_str is immediately before
            prefix = content[:m.start()]
            if check_str not in prefix[-100:]:
                replacement = f"\nif (!customElements.get('{tag}')) {{\n  customElements.define('{tag}', {cls});\n}}"
                content = content[:m.start()] + replacement + content[m.end():]

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Guards updated for {fpath}")

print("Done updating guards.")
