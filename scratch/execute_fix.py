import os
import glob
import re
import shutil

ce_dir = r"wix-repo\src\public\custom-elements"
pub_dir = r"wix-repo\src\public"

# =========================================================================
# STEP 1: Fix hoververse-about.js
# Remove spliced-in careers section, restore clean prototype About page
# =========================================================================
about_files = [
    os.path.join(ce_dir, "hoververse-about.js"),
    os.path.join(pub_dir, "hoververse-about.js")
]

careers_search_regex = re.compile(
    r'<section class="section" id="careers">.*?</section>\s*<section class="section band-paper2" id="open-roles">.*?</section>\s*',
    re.DOTALL
)

for af in about_files:
    with open(af, "r", encoding="utf-8") as f:
        c = f.read()

    # Remove spliced careers section
    if 'id="careers"' in c and 'Build a category, not a feature.' in c:
        c = careers_search_regex.sub('', c)
        print(f"Removed careers section from {af}")

    # Fix CTA button
    c = c.replace(
        '<a href="#careers" class="btn btn--outline btn--lg">Careers <span class="arr">→</span></a>',
        '<a href="/careers" class="btn btn--outline btn--lg">Careers <span class="arr">→</span></a>'
    )
    c = c.replace(
        '<a href="#careers" class="btn btn--outline btn--lg">Careers</a>',
        '<a href="/careers" class="btn btn--outline btn--lg">Careers <span class="arr">→</span></a>'
    )

    with open(af, "w", encoding="utf-8") as f:
        f.write(c)

# =========================================================================
# STEP 2: Fix hoververse-careers.js
# Ensure robust tag aliases and clean link targets
# =========================================================================
careers_alias_code = """const careerTags = ['hoververse-careers', 'hover-careers', 'careers', 'hoververse-career', 'hover-career'];
careerTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseCareers {});
    } catch (err) {}
  }
});"""

careers_files = [
    os.path.join(ce_dir, "hoververse-careers.js"),
    os.path.join(pub_dir, "hoververse-careers.js")
]

for cf in careers_files:
    with open(cf, "r", encoding="utf-8") as f:
        c = f.read()

    # Replace old tag registration at end
    old_def = """if (!customElements.get('hoververse-careers')) {
  customElements.define('hoververse-careers', HoververseCareers);
}"""
    if old_def in c:
        c = c.replace(old_def, careers_alias_code)
    elif "const careerTags" not in c:
        c = re.sub(
            r"if\s*\(!customElements\.get\(['\"]hoververse-careers['\"]\)\)\s*\{[^}]*\}",
            careers_alias_code,
            c
        )

    with open(cf, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"Updated tag aliases in {cf}")

# =========================================================================
# STEP 3: Fix hoververse-footer.js
# Add fullwidth auto-expand wrapper, fullwidth enforcer style, and tag aliases
# =========================================================================
footer_wrapper_guard = """    try {
      // Auto-expand custom element Wix wrapper from default ~28% to 100% full width
      let cur = this;
      while (cur && cur !== document.body) {
        if (cur !== this && (cur.getAttribute('data-testid') === 'custom-element' || (cur.classList && cur.classList.contains('DURcgf')) || (cur.id && cur.id.startsWith('comp-')))) {
          cur.style.setProperty('width', '100%', 'important');
          cur.style.setProperty('max-width', '100%', 'important');
          cur.style.setProperty('min-width', '100%', 'important');
          cur.style.setProperty('margin-left', '0px', 'important');
          cur.style.setProperty('margin-right', '0px', 'important');
          cur.style.setProperty('justify-self', 'stretch', 'important');
          cur.style.setProperty('align-self', 'stretch', 'important');
        }
        if (cur.classList && cur.classList.contains('max-width-container')) {
          cur.style.setProperty('max-width', '100%', 'important');
          cur.style.setProperty('width', '100%', 'important');
          cur.style.setProperty('margin-left', '0px', 'important');
          cur.style.setProperty('margin-right', '0px', 'important');
        }
        cur = cur.parentElement;
      }

      // Hide placeholder Wix default elements
      if (this.parentElement && this.parentElement.parentElement) {
        this.parentElement.parentElement.querySelectorAll('wix-default-custom-element').forEach(defEl => {
          defEl.style.setProperty('display', 'none', 'important');
          if (defEl.parentElement) defEl.parentElement.style.setProperty('display', 'none', 'important');
        });
      }

      // Inject full-width enforcer styles into document
      const fullwidthStyleId = 'hoververse-ce-fullwidth-enforcer';
      if (!document.getElementById(fullwidthStyleId)) {
        const st = document.createElement('style');
        st.id = fullwidthStyleId;
        st.textContent = `
          [data-testid="custom-element"] {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            justify-self: stretch !important;
            align-self: stretch !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .max-width-container {
            max-width: 100% !important;
          }
          wix-default-custom-element {
            display: none !important;
          }
        `;
        document.head.appendChild(st);
      }
    } catch (e) {}
"""

footer_alias_code = """const footerTags = ['hoververse-footer', 'hover-footer', 'site-footer', 'hoververse-foot', 'footer'];
footerTags.forEach(tag => {
  if (!customElements.get(tag)) {
    try {
      customElements.define(tag, class extends HoververseFooter {});
    } catch (err) {}
  }
});"""

footer_files = [
    os.path.join(ce_dir, "hoververse-footer.js"),
    os.path.join(pub_dir, "hoververse-footer.js")
]

for ff in footer_files:
    with open(ff, "r", encoding="utf-8") as f:
        c = f.read()

    # Add fullwidth wrapper if not present
    if "hoververse-ce-fullwidth-enforcer" not in c:
        insert_marker = "const shadow = this.attachShadow({ mode: 'open' });"
        if insert_marker in c:
            c = c.replace(insert_marker, insert_marker + "\n" + footer_wrapper_guard)
            print(f"Added fullwidth enforcer to {ff}")

    # Replace tag definition
    old_footer_def = """if (!customElements.get('hoververse-footer')) {
  customElements.define('hoververse-footer', HoververseFooter);
}"""
    if old_footer_def in c:
        c = c.replace(old_footer_def, footer_alias_code)
    elif "const footerTags" not in c:
        c = re.sub(
            r"if\s*\(!customElements\.get\(['\"]hoververse-footer['\"]\)\)\s*\{[^}]*\}",
            footer_alias_code,
            c
        )

    with open(ff, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"Updated tag aliases in {ff}")

# =========================================================================
# STEP 4: Guard hoververse-home.js so that if mounted inside footer container,
# it renders ONLY the footer instead of the full homepage!
# =========================================================================
home_files = [
    os.path.join(ce_dir, "hoververse-home.js"),
    os.path.join(pub_dir, "hoververse-home.js")
]

# Read footer template from hoververse-footer.js to embed as fallback
with open(os.path.join(ce_dir, "hoververse-footer.js"), "r", encoding="utf-8") as f:
    footer_code = f.read()

# Extract innerHTML assignment from hoververse-footer.js
footer_html_match = re.search(r'shadow\.innerHTML\s*=\s*`([^`]+)`', footer_code)
if footer_html_match:
    footer_shadow_html = footer_html_match.group(1)
else:
    raise ValueError("Could not extract shadow.innerHTML from hoververse-footer.js")

for hf in home_files:
    with open(hf, "r", encoding="utf-8") as f:
        c = f.read()

    # Check if footer detection already added
    if "isFooterContainer" not in c:
        marker = "const shadow = this.attachShadow({ mode: 'open' });"
        footer_fallback_block = """
    // Detection: If <hoververse-home> is mistakenly mounted in Wix master footer container
    const isFooterContainer = Boolean(
      this.closest('footer') ||
      (this.parentElement && this.parentElement.closest && this.parentElement.closest('footer')) ||
      (this.id && this.id.includes('ghd')) ||
      (this.parentElement && this.parentElement.id && this.parentElement.id.includes('ghd'))
    );
    if (isFooterContainer) {
      this.renderFooterOnly(shadow);
      return;
    }"""
        c = c.replace(marker, marker + footer_fallback_block)

        # Add renderFooterOnly method before class closing brace
        # We find the end of connectedCallback or after it
        render_method = """
  renderFooterOnly(shadow) {
    shadow.innerHTML = `""" + footer_shadow_html + """`;
    const yr = shadow.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();
    // Intercept clicks in footer
    shadow.addEventListener('click', (e) => {
      const compPath = e.composedPath ? e.composedPath() : [e.target];
      const a = compPath.find(el => el && el.tagName === 'A');
      if (!a) return;
      const rawHref = a.getAttribute('href');
      if (!rawHref) return;
      if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || a.getAttribute('target') === '_blank') return;
      e.preventDefault();
      try {
        if (window.top && window.top.location) {
          window.top.location.href = rawHref;
          return;
        }
      } catch (err) {}
      window.location.href = rawHref;
    });
  }
"""
        # Insert renderFooterOnly before the last closing brace of HoververseHome class
        c = re.sub(r'(\}\s*\n\s*const homeTags =)', render_method + r'\n\1', c)
        print(f"Added footer container detection and renderFooterOnly to {hf}")

    with open(hf, "w", encoding="utf-8") as f:
        f.write(c)

# =========================================================================
# STEP 5: Update all 34 custom element files in wix-repo
# - href="/about#careers" -> href="/careers"
# - remove 'careers': 'about#careers' from slugAliasMap
# =========================================================================
all_js = glob.glob(r"wix-repo\src\public\**\*.js", recursive=True)
print(f"\nUpdating links and router across {len(all_js)} JS files...")

count_links = 0
count_router = 0

for jf in all_js:
    with open(jf, "r", encoding="utf-8") as f:
        c = f.read()

    changed = False

    # 1. Update nav and footer links to careers
    if '/about#careers' in c:
        c = c.replace('/about#careers', '/careers')
        changed = True
        count_links += 1

    # 2. Clean slugAliasMap
    # Old map had: 'careers': 'about#careers'
    old_alias_careers = ",\n        'careers': 'about#careers'"
    old_alias_careers_2 = ",\r\n        'careers': 'about#careers'"
    old_alias_careers_3 = "'careers': 'about#careers'"

    if old_alias_careers in c:
        c = c.replace(old_alias_careers, "")
        changed = True
        count_router += 1
    elif old_alias_careers_2 in c:
        c = c.replace(old_alias_careers_2, "")
        changed = True
        count_router += 1
    elif old_alias_careers_3 in c:
        c = re.sub(r",?\s*'careers'\s*:\s*'about#careers'", "", c)
        changed = True
        count_router += 1

    if changed:
        with open(jf, "w", encoding="utf-8") as f:
            f.write(c)

print(f"Updated careers links in {count_links} files.")
print(f"Removed careers alias redirect from router in {count_router} files.")
print("\nAll tasks completed successfully!")
