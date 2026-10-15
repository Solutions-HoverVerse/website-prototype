import os
import glob

# 1. Update resources files (custom-elements and public and html)
def update_resources_card(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (does not exist)")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Look for the suite card with the whitepaper
    old_card_pattern = """      <a class="suite reveal d3" href="assets/whitepapers/hoververse-market-evolution-thesis.pdf" target="_blank" rel="noopener" style="padding:30px 28px">
        <span class="kicker">Hoververse Market Evolution Thesis</span>
        <h3 style="margin:12px 0 10px">AI Is the Catalyst for the Next Input Era</h3>
        <p>Why AI is the third major computing input revolution — and why the platform that owns it will be built for shared physical space, not personal devices.</p>
        <span class="more">Download the white paper <span class="arr">→</span></span>
      </a>"""

    new_card_pattern = """      <a class="suite reveal d3" href="assets/whitepapers/hoververse-market-evolution-thesis.pdf" target="_blank" rel="noopener" download="hoververse-market-evolution-thesis.pdf" style="padding:30px 28px">
        <span class="kicker">Hover OS · An Essay</span>
        <h3 style="margin:12px 0 10px">AI Is the Catalyst for the Next Input Era</h3>
        <p>An essay on input paradigms, platform value, and the case for Hover OS — why AI is the fourth major computing input revolution and why value concentrates in shared physical space.</p>
        <span class="more">Download the white paper <span class="arr">→</span></span>
      </a>"""

    if old_card_pattern in content:
        content = content.replace(old_card_pattern, new_card_pattern)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated card in {filepath}")
    else:
        print(f"Pattern not found in {filepath}, checking fallback...")
        # Check if already updated or slight variation
        if 'download="hoververse-market-evolution-thesis.pdf"' in content:
            print(f"Already updated in {filepath}")
        else:
            print(f"Could not match card in {filepath}")

# 2. Update home files (custom-elements, public, index.html, wix-home-embed.html)
def update_home_link(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (does not exist)")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    old_link = '<a class="par-wp-link reveal" href="assets/whitepapers/hoververse-market-evolution-thesis.pdf" target="_blank" rel="noopener">Read the white paper — AI Is the Catalyst for the Next Input Era <span class="arr">→</span></a>'
    new_link = '<a class="par-wp-link reveal" href="assets/whitepapers/hoververse-market-evolution-thesis.pdf" target="_blank" rel="noopener" download="hoververse-market-evolution-thesis.pdf">Read the white paper — AI Is the Catalyst for the Next Input Era <span class="arr">→</span></a>'

    if old_link in content:
        content = content.replace(old_link, new_link)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated home link in {filepath}")
    else:
        print(f"Home link pattern not found or already updated in {filepath}")

# 3. Update router in all JS files
def update_router(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False

    old_check = """      if (h.startsWith('http://') || h.startsWith('https://')) {
        if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
        return;
      }
      if (h.startsWith('#')) return;

      a.setAttribute('target', '_top');"""

    new_check = """      if (a.getAttribute('target') === '_blank' || (h && h.toLowerCase().includes('.pdf'))) {
        if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
        return;
      }
      if (h.startsWith('http://') || h.startsWith('https://')) {
        if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
        return;
      }
      if (h.startsWith('#')) return;

      a.setAttribute('target', '_top');"""

    if old_check in content:
        content = content.replace(old_check, new_check)
        changed = True

    old_click = """      if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || a.getAttribute('target') === '_blank') {
        return;
      }"""

    new_click = """      if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || a.getAttribute('target') === '_blank' || rawHref.toLowerCase().includes('.pdf')) {
        return;
      }"""

    if old_click in content:
        content = content.replace(old_click, new_click)
        changed = True

    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated router in {filepath}")

# Run updates
update_resources_card("resources.html")
update_resources_card("wix-repo/src/public/hoververse-resources.js")
update_resources_card("wix-repo/src/public/custom-elements/hoververse-resources.js")

update_home_link("index.html")
update_home_link("wix-assets/wix-home-embed.html")
update_home_link("wix-repo/src/public/hoververse-home.js")
update_home_link("wix-repo/src/public/custom-elements/hoververse-home.js")

js_files = glob.glob("wix-repo/src/public/**/*.js", recursive=True)
for jf in js_files:
    update_router(jf)

print("All updates completed.")
