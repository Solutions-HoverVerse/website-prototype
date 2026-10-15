import os
import shutil

ce_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public\custom-elements"
pub_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public"

# The problematic snippet to replace:
old_snippet = """      const cleanTargetSlugRaw = targetPath.replace(sitePrefix, '').replace(/^\\/+|\\/+$/g, '');
      const slugAliasMap = {
        'biosafety': 'hover-biosafety',
        'living-heritage': 'hover-living'
      };
      const cleanTargetSlug = slugAliasMap[cleanTargetSlugRaw] || cleanTargetSlugRaw;
      if (slugAliasMap[cleanTargetSlugRaw]) {
        targetPath = (sitePrefix ? sitePrefix : '') + '/' + cleanTargetSlug;
        rawHref = targetPath + (targetHash ? '#' + targetHash : '');
      }"""

new_snippet = """      const cleanTargetSlugRaw = targetPath.replace(sitePrefix, '').replace(/^\\/+|\\/+$/g, '');
      const slugAliasMap = {
        'biosafety': 'hover-biosafety',
        'living-heritage': 'hover-living'
      };
      const cleanTargetSlug = slugAliasMap[cleanTargetSlugRaw] || cleanTargetSlugRaw;"""

# And update the cross-page navigation block:
old_cross = """      // Cross-page navigation: ensure correct prefix and navigate top window
      e.preventDefault();
      let fullDest = rawHref;
      if (sitePrefix && rawHref.startsWith('/') && !rawHref.startsWith(sitePrefix + '/')) {
        fullDest = rawHref === '/' ? sitePrefix : sitePrefix + rawHref;
      }"""

new_cross = """      // Cross-page navigation: ensure correct prefix and navigate top window
      e.preventDefault();
      let fullDest = rawHref;
      if (slugAliasMap && slugAliasMap[cleanTargetSlugRaw]) {
        const mappedTarget = (sitePrefix ? sitePrefix : '') + '/' + cleanTargetSlug;
        fullDest = mappedTarget + (targetHash ? '#' + targetHash : '');
      } else if (sitePrefix && rawHref.startsWith('/') && !rawHref.startsWith(sitePrefix + '/')) {
        fullDest = rawHref === '/' ? sitePrefix : sitePrefix + rawHref;
      }"""

files = [f for f in os.listdir(ce_dir) if f.endswith(".js")]
for fname in files:
    fpath = os.path.join(ce_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False
    if old_snippet in content:
        content = content.replace(old_snippet, new_snippet)
        changed = True

    if old_cross in content:
        content = content.replace(old_cross, new_cross)
        changed = True

    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed no-const-assign in {fname}")

    # Mirror to pub_dir
    shutil.copy2(fpath, os.path.join(pub_dir, fname))

print("Mirrored all updated files to src/public/")
