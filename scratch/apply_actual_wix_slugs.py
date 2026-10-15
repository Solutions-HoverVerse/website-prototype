import os
import shutil
import re

ce_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public\custom-elements"
pub_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public"

# 1. Update tag registrations in the 4 solution components
# In hoververse-biosafety.js:
bio_path = os.path.join(ce_dir, "hoververse-biosafety.js")
with open(bio_path, "r", encoding="utf-8") as f:
    bio_content = f.read()

old_bio_tags = """const bioTags = ['hoververse-biosafety', 'biosafety', 'hoververse-bio'];
bioTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseBiosafety {});
    } catch (err) {}
  }
});"""

new_bio_tags = """const bioTags = ['hoververse-biosafety', 'hover-biosafety', 'biosafety', 'hoververse-bio', 'hover-bio'];
bioTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseBiosafety {});
    } catch (err) {}
  }
});"""

if old_bio_tags in bio_content:
    bio_content = bio_content.replace(old_bio_tags, new_bio_tags)
    with open(bio_path, "w", encoding="utf-8") as f:
        f.write(bio_content)
    print("Updated bioTags in hoververse-biosafety.js")
else:
    print("old_bio_tags not found, checking regex...")
    bio_content = re.sub(r"const bioTags = \[[^\]]*\];", "const bioTags = ['hoververse-biosafety', 'hover-biosafety', 'biosafety', 'hoververse-bio', 'hover-bio'];", bio_content)
    with open(bio_path, "w", encoding="utf-8") as f:
        f.write(bio_content)
    print("Regex-replaced bioTags in hoververse-biosafety.js")

# In hoververse-living-heritage.js:
lh_path = os.path.join(ce_dir, "hoververse-living-heritage.js")
with open(lh_path, "r", encoding="utf-8") as f:
    lh_content = f.read()

old_lh_tags = """const lhTags = ['hoververse-living-heritage', 'living-heritage', 'hoververse-heritage', 'hoververse-living'];
lhTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseLivingHeritage {});
    } catch (err) {}
  }
});"""

new_lh_tags = """const lhTags = ['hoververse-living-heritage', 'hover-living', 'hover-living-heritage', 'living-heritage', 'hoververse-heritage', 'hoververse-living', 'hover-heritage'];
lhTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseLivingHeritage {});
    } catch (err) {}
  }
});"""

if old_lh_tags in lh_content:
    lh_content = lh_content.replace(old_lh_tags, new_lh_tags)
    with open(lh_path, "w", encoding="utf-8") as f:
        f.write(lh_content)
    print("Updated lhTags in hoververse-living-heritage.js")
else:
    print("old_lh_tags not found, checking regex...")
    lh_content = re.sub(r"const lhTags = \[[^\]]*\];", "const lhTags = ['hoververse-living-heritage', 'hover-living', 'hover-living-heritage', 'living-heritage', 'hoververse-heritage', 'hoververse-living', 'hover-heritage'];", lh_content)
    with open(lh_path, "w", encoding="utf-8") as f:
        f.write(lh_content)
    print("Regex-replaced lhTags in hoververse-living-heritage.js")

# 2. Update all link targets across all files:
# href="/biosafety" -> href="/hover-biosafety"
# href="/living-heritage" -> href="/hover-living"
# and ensure knownSlugs has both in all files!

files = [f for f in os.listdir(ce_dir) if f.endswith(".js")]
for fname in files:
    fpath = os.path.join(ce_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        c = f.read()

    changed = False

    # Link replacement
    if 'href="/biosafety"' in c:
        c = c.replace('href="/biosafety"', 'href="/hover-biosafety"')
        changed = True
    if 'href="/living-heritage"' in c:
        c = c.replace('href="/living-heritage"', 'href="/hover-living"')
        changed = True

    # Update knownSlugs
    old_known = "'hover-health', 'biosafety', 'living-heritage', 'hover-sr'"
    new_known = "'hover-health', 'hover-biosafety', 'hover-living', 'hover-sr', 'biosafety', 'living-heritage'"
    if old_known in c:
        c = c.replace(old_known, new_known)
        changed = True

    # Add slug alias redirection in router
    router_anchor = "const cleanTargetSlug = targetPath.replace(sitePrefix, '').replace(/^\\/+|\\/+$/g, '');"
    router_redirect = """const cleanTargetSlugRaw = targetPath.replace(sitePrefix, '').replace(/^\\/+|\\/+$/g, '');
      const slugAliasMap = {
        'biosafety': 'hover-biosafety',
        'living-heritage': 'hover-living'
      };
      const cleanTargetSlug = slugAliasMap[cleanTargetSlugRaw] || cleanTargetSlugRaw;
      if (slugAliasMap[cleanTargetSlugRaw]) {
        targetPath = (sitePrefix ? sitePrefix : '') + '/' + cleanTargetSlug;
        rawHref = targetPath + (targetHash ? '#' + targetHash : '');
      }"""
    if router_anchor in c and "const slugAliasMap" not in c:
        c = c.replace(router_anchor, router_redirect)
        changed = True

    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"Updated links & router in {fname}")

    # Mirror to pub_dir
    shutil.copy2(fpath, os.path.join(pub_dir, fname))

print("Mirrored all updated files to src/public/")
