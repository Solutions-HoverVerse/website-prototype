import os
import glob

ce_dir = r"wix-repo\src\public\custom-elements"
pub_dir = r"wix-repo\src\public"

# The old snippet for knownSlugs
old_slugs = """    const knownSlugs = new Set([
      '', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
      'hover-health', 'biosafety', 'living-heritage', 'hover-sr',
      'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
    ]);"""

new_slugs = """    const knownSlugs = new Set([
      '', 'home', 'platform', 'solutions', 'why-hoververse', 'resources', 'about',
      'hover-health', 'biosafety', 'hover-biosafety', 'living-heritage', 'hover-living', 'hover-sr',
      'leadership', 'careers', 'investors', 'terms-of-service', 'privacy-policy'
    ]);"""

# The old preprocessor href adjustment for '/'
old_prep = """      if (sitePrefix && h.startsWith('/')) {
        if (!h.startsWith(sitePrefix + '/') && h !== sitePrefix) {
          a.setAttribute('href', h === '/' ? sitePrefix : sitePrefix + h);
        }
      }"""

new_prep = """      if (sitePrefix && h.startsWith('/')) {
        if (!h.startsWith(sitePrefix + '/') && h !== sitePrefix && h !== (sitePrefix + '/')) {
          a.setAttribute('href', h === '/' ? sitePrefix + '/' : sitePrefix + h);
        }
      }"""

# The old brand logo scroll check
old_scroll_check = """      // Clicking brand logo while on home page -> smooth scroll to top
      if ((targetPath === '/' || targetPath === sitePrefix || targetPath === sitePrefix + '/' || targetPath === '') && (currSlug === '' || currSlug === 'home') && !hasHash) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }"""

new_scroll_check = """      // Clicking brand logo while on home page -> smooth scroll to top
      const isTargetHome = cleanTargetSlugRaw === '' || cleanTargetSlugRaw === 'home';
      const isCurrentHome = currSlug === '' || currSlug === 'home';
      if (isTargetHome && isCurrentHome && !hasHash) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
          if (window.top) window.top.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {}
        return;
      }"""

# The old cross-page navigation block
old_nav_block = """      // Cross-page navigation: ensure correct prefix and navigate top window
      e.preventDefault();
      let fullDest = rawHref;
      if (slugAliasMap && slugAliasMap[cleanTargetSlugRaw]) {
        const mappedTarget = (sitePrefix ? sitePrefix : '') + '/' + cleanTargetSlug;
        fullDest = mappedTarget + (targetHash ? '#' + targetHash : '');
      } else if (sitePrefix && rawHref.startsWith('/') && !rawHref.startsWith(sitePrefix + '/')) {
        fullDest = rawHref === '/' ? sitePrefix : sitePrefix + rawHref;
      }
      try {
        if (window.top && window.top.location) {
          window.top.location.href = fullDest;
          return;
        }
      } catch (err) {}
      window.location.href = fullDest;"""

new_nav_block = """      // Cross-page navigation: ensure correct prefix and navigate top window
      e.preventDefault();
      let fullDest;
      if (cleanTargetSlugRaw === '' || cleanTargetSlugRaw === 'home') {
        fullDest = sitePrefix ? (sitePrefix + (targetHash ? '#' + targetHash : '/')) : ('/' + (targetHash ? '#' + targetHash : ''));
      } else {
        const destSlug = slugAliasMap[cleanTargetSlugRaw] || cleanTargetSlugRaw;
        fullDest = (sitePrefix ? sitePrefix : '') + '/' + destSlug + (targetHash ? '#' + targetHash : '');
      }
      try {
        if (window.top && window.top.location) {
          window.top.location.href = fullDest;
          return;
        }
      } catch (err) {}
      window.location.href = fullDest;"""

js_files = glob.glob(r"wix-repo\src\public\**\*.js", recursive=True)
updated_count = 0

for filepath in js_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False

    if old_slugs in content:
        content = content.replace(old_slugs, new_slugs)
        changed = True

    if old_prep in content:
        content = content.replace(old_prep, new_prep)
        changed = True

    if old_scroll_check in content:
        content = content.replace(old_scroll_check, new_scroll_check)
        changed = True

    if old_nav_block in content:
        content = content.replace(old_nav_block, new_nav_block)
        changed = True

    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        updated_count += 1
        print(f"Updated {filepath}")

print(f"\nFinished: Updated {updated_count} files.")
