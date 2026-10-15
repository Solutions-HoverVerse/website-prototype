import os
import shutil

ce_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public\custom-elements"
pub_dir = r"c:\Users\Jeff\OneDrive - Hoververse\Antigravity Apps\Hoververse Website Rev 2\Hoververse Website\hoververse-site\wix-repo\src\public"

enforcer_code = """    try {
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

page_files = [
    "hoververse-hover-health.js",
    "hoververse-hover-sr.js",
    "hoververse-biosafety.js",
    "hoververse-living-heritage.js",
    "hoververse-solutions.js",
    "hoververse-platform.js",
    "hoververse-why-hoververse.js",
    "hoververse-resources.js",
    "hoververse-about.js",
    "hoververse-leadership.js",
    "hoververse-careers.js",
    "hoververse-investors.js",
    "hoververse-terms-of-service.js",
    "hoververse-privacy-policy.js",
    "hoververse-home.js"
]

for fname in page_files:
    fpath = os.path.join(ce_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find where to insert: right after if (this.shadowRoot) return;\n    const shadow = this.attachShadow({ mode: 'open' });
    anchor = "const shadow = this.attachShadow({ mode: 'open' });"
    if anchor in content and "hoververse-ce-fullwidth-enforcer" not in content:
        # Check if there's already header/footer hiding logic right after anchor
        content = content.replace(anchor, anchor + "\n" + enforcer_code)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added full-width enforcer to {fname}")
    elif "hoververse-ce-fullwidth-enforcer" in content:
        print(f"Already present in {fname}")
    else:
        print(f"Anchor not found in {fname}")

    # Mirror to pub_dir
    shutil.copy2(fpath, os.path.join(pub_dir, fname))

print("Mirrored all updated files to src/public/")
