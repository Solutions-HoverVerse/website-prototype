import os
import shutil

ce_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public\custom-elements"
pub_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public"

# 1. Update hoververse-solutions.js
sol_file = os.path.join(ce_dir, "hoververse-solutions.js")
with open(sol_file, "r", encoding="utf-8") as f:
    sol_content = f.read()

# Replace matrix rows
sol_content = sol_content.replace('<a class="matrix-row" href="#hover-health">', '<a class="matrix-row" href="/hover-health">')
sol_content = sol_content.replace('<a class="matrix-row" href="#rehab">', '<a class="matrix-row" href="/hover-health#rehab">')
sol_content = sol_content.replace('<a class="matrix-row" href="#biosafety">', '<a class="matrix-row" href="/biosafety">')
sol_content = sol_content.replace('<a class="matrix-row" href="#living-heritage">', '<a class="matrix-row" href="/living-heritage">')
sol_content = sol_content.replace('<a class="matrix-row" href="#hover-sr">', '<a class="matrix-row" href="/hover-sr">')

# Replace suite cards
sol_content = sol_content.replace('href="mailto:solutions@hoververse.ai?subject=Hover%20Health%20Inquiry" id="hover-health"', 'href="/hover-health" id="hover-health"')
sol_content = sol_content.replace('href="mailto:solutions@hoververse.ai?subject=Touchless%20Rehab%20Inquiry" id="rehab"', 'href="/hover-health#rehab" id="rehab"')
sol_content = sol_content.replace('href="mailto:solutions@hoververse.ai?subject=Biosafety%20Cleanroom%20Inquiry" id="biosafety"', 'href="/biosafety" id="biosafety"')
sol_content = sol_content.replace('href="mailto:solutions@hoververse.ai?subject=Living%20Heritage%20Inquiry" id="living-heritage"', 'href="/living-heritage" id="living-heritage"')
sol_content = sol_content.replace('href="mailto:solutions@hoververse.ai?subject=Hover%20SR%20Inquiry" id="hover-sr"', 'href="/hover-sr" id="hover-sr"')

with open(sol_file, "w", encoding="utf-8") as f:
    f.write(sol_content)
print("Updated hoververse-solutions.js matrix and suite cards")

# 2. Tag alias updates for the 4 dedicated detail pages
tag_alias_map = {
    "hoververse-hover-health.js": (
        "if (!customElements.get('hoververse-hover-health')) {\n  customElements.define('hoververse-hover-health', HoververseHoverHealth);\n}",
        """const healthTags = ['hoververse-hover-health', 'hover-health', 'hoververse-health'];
healthTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseHoverHealth {});
    } catch (err) {}
  }
});"""
    ),
    "hoververse-biosafety.js": (
        "if (!customElements.get('hoververse-biosafety')) {\n  customElements.define('hoververse-biosafety', HoververseBiosafety);\n}",
        """const bioTags = ['hoververse-biosafety', 'biosafety', 'hoververse-bio'];
bioTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseBiosafety {});
    } catch (err) {}
  }
});"""
    ),
    "hoververse-living-heritage.js": (
        "if (!customElements.get('hoververse-living-heritage')) {\n  customElements.define('hoververse-living-heritage', HoververseLivingHeritage);\n}",
        """const lhTags = ['hoververse-living-heritage', 'living-heritage', 'hoververse-heritage', 'hoververse-living'];
lhTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseLivingHeritage {});
    } catch (err) {}
  }
});"""
    ),
    "hoververse-hover-sr.js": (
        "if (!customElements.get('hoververse-hover-sr')) {\n  customElements.define('hoververse-hover-sr', HoververseHoverSR);\n}",
        """const srTags = ['hoververse-hover-sr', 'hover-sr', 'hoververse-sr'];
srTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseHoverSR {});
    } catch (err) {}
  }
});"""
    ),
}

for fname, (target, repl) in tag_alias_map.items():
    fpath = os.path.join(ce_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        c = f.read()
    if target in c:
        c = c.replace(target, repl)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"Added tag aliases to {fname}")
    else:
        print(f"Target not found in {fname}")

# 3. Update all nav dropdown and footer links across ALL custom elements
# From:
# /solutions#hover-health -> /hover-health
# /solutions#rehab -> /hover-health#rehab
# /solutions#biosafety -> /biosafety
# /solutions#living-heritage -> /living-heritage
# /solutions#hover-sr -> /hover-sr

replacements = [
    ('href="/solutions#hover-health"', 'href="/hover-health"'),
    ('href="/solutions#rehab"', 'href="/hover-health#rehab"'),
    ('href="/solutions#biosafety"', 'href="/biosafety"'),
    ('href="/solutions#living-heritage"', 'href="/living-heritage"'),
    ('href="/solutions#hover-sr"', 'href="/hover-sr"'),
]

js_files = [f for f in os.listdir(ce_dir) if f.endswith(".js")]
for fname in js_files:
    fpath = os.path.join(ce_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        c = f.read()
    changed = False
    for old, new in replacements:
        if old in c:
            c = c.replace(old, new)
            changed = True
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"Updated solutions links in {fname}")

# 4. Mirror all files to src/public/
for fname in js_files:
    src_p = os.path.join(ce_dir, fname)
    dst_p = os.path.join(pub_dir, fname)
    shutil.copy2(src_p, dst_p)
print("Mirrored all updated files from custom-elements/ to src/public/")
