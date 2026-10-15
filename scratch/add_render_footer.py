import os
import re

ce_home = r"wix-repo\src\public\custom-elements\hoververse-home.js"
pub_home = r"wix-repo\src\public\hoververse-home.js"

with open(r"wix-repo\src\public\custom-elements\hoververse-footer.js", "r", encoding="utf-8") as f:
    footer_code = f.read()

# Extract innerHTML assignment from hoververse-footer.js
footer_shadow_match = re.search(r'shadow\.innerHTML\s*=\s*`([^`]+)`', footer_code)
if not footer_shadow_match:
    raise ValueError("Could not extract shadow.innerHTML from hoververse-footer.js")

footer_shadow_html = footer_shadow_match.group(1)

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

for path in [ce_home, pub_home]:
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()

    if "renderFooterOnly(shadow) {" not in c:
        # Find the last closing brace of the class HoververseHome
        target = "\n  }\n}\n\nif (!customElements.get('hoververse-home'))"
        replacement = "\n  }\n" + render_method + "\n}\n\nif (!customElements.get('hoververse-home'))"
        if target in c:
            c = c.replace(target, replacement)
            with open(path, "w", encoding="utf-8") as f:
                f.write(c)
            print(f"Successfully added renderFooterOnly to {path}")
        else:
            print(f"Could not find target in {path}")
    else:
        print(f"Already defined in {path}")
