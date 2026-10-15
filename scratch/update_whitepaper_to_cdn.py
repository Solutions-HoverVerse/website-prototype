import os
import glob
import re

CDN_PDF_URL = "https://raw.githubusercontent.com/Solutions-HoverVerse/website-prototype/main/assets/whitepapers/hoververse-market-evolution-thesis.pdf"
DOWNLOAD_NAME = "Hover-OS-Essay-AI-is-the-Catalyst.pdf"

# 1. Update all JS files in wix-repo
js_files = glob.glob(r"wix-repo\src\public\**\*.js", recursive=True)
print(f"Scanning {len(js_files)} JS files...")

for fpath in js_files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False

    # Replace relative whitepaper paths with CDN URL
    old_patterns = [
        'href="assets/whitepapers/hoververse-market-evolution-thesis.pdf"',
        'href="/assets/whitepapers/hoververse-market-evolution-thesis.pdf"',
        'href="assets/whitepapers/ai-is-the-catalyst-hover-os-essay.pdf"',
        'href="/assets/whitepapers/ai-is-the-catalyst-hover-os-essay.pdf"',
    ]
    for op in old_patterns:
        if op in content:
            content = content.replace(op, f'href="{CDN_PDF_URL}"')
            changed = True

    # Ensure download attribute is present on whitepaper links
    # Look for wp link pattern
    suite_old = f'<a class="suite reveal d3" href="{CDN_PDF_URL}" target="_blank" rel="noopener"'
    suite_with_dl = f'<a class="suite reveal d3" href="{CDN_PDF_URL}" target="_blank" rel="noopener" download="{DOWNLOAD_NAME}"'
    if suite_old in content and f'download="{DOWNLOAD_NAME}"' not in content:
        content = re.sub(
            rf'<a class="suite reveal d3" href="{re.escape(CDN_PDF_URL)}" target="_blank" rel="noopener"(?: download="[^"]*")?',
            suite_with_dl,
            content
        )
        changed = True

    # In home page
    home_old = f'<a class="par-wp-link reveal" href="{CDN_PDF_URL}" target="_blank" rel="noopener"'
    home_with_dl = f'<a class="par-wp-link reveal" href="{CDN_PDF_URL}" target="_blank" rel="noopener" download="{DOWNLOAD_NAME}"'
    if home_old in content and f'download="{DOWNLOAD_NAME}"' not in content:
        content = re.sub(
            rf'<a class="par-wp-link reveal" href="{re.escape(CDN_PDF_URL)}" target="_blank" rel="noopener"(?: download="[^"]*")?',
            home_with_dl,
            content
        )
        changed = True

    # In footers
    footer_old = f'<a href="{CDN_PDF_URL}" target="_blank" rel="noopener">Market Evolution Thesis</a>'
    footer_with_dl = f'<a href="{CDN_PDF_URL}" target="_blank" rel="noopener" download="{DOWNLOAD_NAME}">Market Evolution Thesis</a>'
    if footer_old in content:
        content = content.replace(footer_old, footer_with_dl)
        changed = True

    # Now update the click interceptor to handle download programmatically with fetch blob
    old_pdf_interceptor = """      if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || a.getAttribute('target') === '_blank' || rawHref.toLowerCase().includes('.pdf')) {
        return;
      }"""

    new_pdf_interceptor = """      if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || a.getAttribute('target') === '_blank' || rawHref.toLowerCase().includes('.pdf')) {
        if (a.hasAttribute('download') || rawHref.toLowerCase().includes('.pdf')) {
          e.preventDefault();
          const dlUrl = a.getAttribute('href') || 'https://raw.githubusercontent.com/Solutions-HoverVerse/website-prototype/main/assets/whitepapers/hoververse-market-evolution-thesis.pdf';
          const dlName = a.getAttribute('download') || 'Hover-OS-Essay-AI-is-the-Catalyst.pdf';
          fetch(dlUrl)
            .then(res => {
              if (!res.ok) throw new Error('Status ' + res.status);
              return res.blob();
            })
            .then(blob => {
              const bUrl = URL.createObjectURL(blob);
              const t = document.createElement('a');
              t.href = bUrl;
              t.download = dlName;
              document.body.appendChild(t);
              t.click();
              document.body.removeChild(t);
              setTimeout(() => URL.revokeObjectURL(bUrl), 20000);
            })
            .catch(() => {
              window.open(dlUrl, '_blank');
            });
        }
        return;
      }"""

    if old_pdf_interceptor in content:
        content = content.replace(old_pdf_interceptor, new_pdf_interceptor)
        changed = True

    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fpath}")

# 2. Also update HTML files in root and wix-assets
html_files = [
    "resources.html",
    "index.html",
    "why-hoververse.html",
    "platform.html",
    "solutions.html",
    "living-heritage.html",
    "investors.html",
    "leadership.html",
    "privacy-policy.html",
    "terms-of-service.html",
    "wix-assets/wix-home-embed.html"
]

for hpath in html_files:
    if not os.path.exists(hpath):
        continue
    with open(hpath, "r", encoding="utf-8") as f:
        content = f.read()
    changed = False

    for op in old_patterns:
        if op in content:
            content = content.replace(op, f'href="{CDN_PDF_URL}"')
            changed = True

    footer_old = f'<a href="{CDN_PDF_URL}">Market Evolution Thesis</a>'
    footer_with_dl = f'<a href="{CDN_PDF_URL}" target="_blank" rel="noopener" download="{DOWNLOAD_NAME}">Market Evolution Thesis</a>'
    if footer_old in content:
        content = content.replace(footer_old, footer_with_dl)
        changed = True

    footer_target = f'<a href="{CDN_PDF_URL}" target="_blank" rel="noopener">Market Evolution Thesis</a>'
    if footer_target in content:
        content = content.replace(footer_target, footer_with_dl)
        changed = True

    # resources.html suite card
    if 'href="' + CDN_PDF_URL + '"' in content and f'download="{DOWNLOAD_NAME}"' not in content:
        content = re.sub(
            rf'<a class="suite reveal d3" href="{re.escape(CDN_PDF_URL)}" target="_blank" rel="noopener"(?: download="[^"]*")?',
            f'<a class="suite reveal d3" href="{CDN_PDF_URL}" target="_blank" rel="noopener" download="{DOWNLOAD_NAME}"',
            content
        )
        changed = True

    if changed:
        with open(hpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated HTML {hpath}")

print("Done updating whitepaper links and download handler!")
