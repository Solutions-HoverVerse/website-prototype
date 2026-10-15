import os
import glob
import re

CAREERS_HTML = """<section class="section" id="careers">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Careers at Hoververse</p>
      <h2 class="h-2">Build a category, not a feature.</h2>
      <p class="lead">We're a collective of builders and dreamers redefining how people engage with technology. If you're passionate about spatial computing, gesture-based computing and leading Physical AI for the built environment alongside personal and robotic Physical AI, explore our open opportunities to join our team.</p>
    </div>
    <div class="stake reveal" style="margin-top:28px">
      <div class="who"><span class="role">Innovate fearlessly</span><p>We challenge convention and push the boundaries of physical-digital interaction.</p></div>
      <div class="who"><span class="role">Build the future</span><p>We are creators of a new interface paradigm — screenless, seamless and scalable.</p></div>
      <div class="who"><span class="role">User first</span><p>We design with empathy, ensuring our platform adapts instinctively to real-world environments.</p></div>
      <div class="who"><span class="role">Embrace collaboration</span><p>We thrive on teamwork and shared expertise, solving complex architectural challenges together.</p></div>
    </div>
  </div>
</section>

<section class="section band-paper2" id="open-roles">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Open roles</p>
      <h2 class="h-2">Where we're hiring.</h2>
      <p class="lead">We hire across computer vision, edge systems, deployment engineering and enterprise sales. Don't see your role? Introduce yourself — we review every note.</p>
    </div>
    <div class="roles reveal">
      <a class="role-row" href="mailto:careers@hoververse.ai?subject=Computer%20Vision%20Engineer">
        <div class="r-t"><b>Computer Vision Engineer</b><span>Engineering · Deterministic CV pipelines</span></div><span class="go">Apply <span class="arr">→</span></span>
      </a>
      <a class="role-row" href="mailto:careers@hoververse.ai?subject=Edge%20Systems%20Engineer">
        <div class="r-t"><b>Edge Systems Engineer</b><span>Engineering · Cross-platform edge OS &amp; silicon</span></div><span class="go">Apply <span class="arr">→</span></span>
      </a>
      <a class="role-row" href="mailto:careers@hoververse.ai?subject=Deployment%20Engineer">
        <div class="r-t"><b>Deployment Engineer</b><span>Field · Site-specific retrofits &amp; calibration</span></div><span class="go">Apply <span class="arr">→</span></span>
      </a>
      <a class="role-row" href="mailto:careers@hoververse.ai?subject=Enterprise%20Account%20Executive">
        <div class="r-t"><b>Enterprise Account Executive</b><span>Commercial · Healthcare &amp; public sector</span></div><span class="go">Apply <span class="arr">→</span></span>
      </a>
      <a class="role-row" href="mailto:careers@hoververse.ai?subject=General%20Interest">
        <div class="r-t"><b>General interest</b><span>Tell us where you'd make the biggest difference</span></div><span class="go">Introduce yourself <span class="arr">→</span></span>
      </a>
    </div>
    <div class="cta-actions reveal" style="justify-content:flex-start;margin-top:32px">
      <a href="mailto:careers@hoververse.ai" class="btn btn--primary btn--lg">Send us your résumé <span class="arr">→</span></a>
      <a href="#demo" class="btn btn--outline btn--lg">Request a demo</a>
    </div>
    <p class="lead" style="margin-top:20px;font-size:14px;color:var(--faint)">Role list is illustrative — connect with us to learn more about active opportunities.</p>
  </div>
</section>"""

# 1. Update hoververse-about.js in both directories
about_files = [
    r"wix-repo\src\public\hoververse-about.js",
    r"wix-repo\src\public\custom-elements\hoververse-about.js"
]

target_search = """</section>

<section class="section cta-band" id="demo">"""

replacement_text = """</section>

""" + CAREERS_HTML + """

<section class="section cta-band" id="demo">"""

for ab_path in about_files:
    with open(ab_path, "r", encoding="utf-8") as f:
        content = f.read()

    if 'id="careers"' in content and '<section class="section" id="careers">' in content:
        print(f"Careers section already in {ab_path}")
    elif target_search in content:
        # replace only the last occurrence before cta-band id="demo"
        content = content.replace(target_search, replacement_text)
        # Update the demo banner careers button to scroll to #careers instead of mailto with duplicate id="careers"
        content = content.replace(
            '<a href="mailto:careers@hoververse.ai" class="btn btn--outline btn--lg" id="careers">Careers <span class="arr">→</span></a>',
            '<a href="#careers" class="btn btn--outline btn--lg">Careers <span class="arr">→</span></a>'
        )
        with open(ab_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added careers section to {ab_path}")
    else:
        print(f"Could not find insertion point in {ab_path}")

# 2. Update about.html prototype in root
about_html_path = "about.html"
with open(about_html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

if '<section class="section" id="careers">' not in html_content:
    if target_search in html_content:
        html_content = html_content.replace(target_search, replacement_text)
        html_content = html_content.replace(
            '<a href="careers.html" class="btn btn--outline btn--lg">Careers</a>',
            '<a href="#careers" class="btn btn--outline btn--lg">Careers <span class="arr">→</span></a>'
        )
        # Also update nav dropdown and footer on about.html
        html_content = html_content.replace('<a href="careers.html">Careers</a>', '<a href="#careers">Careers</a>')
        html_content = html_content.replace('<li><a href="careers.html">Careers</a></li>', '<li><a href="#careers">Careers</a></li>')
        with open(about_html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"Updated prototype {about_html_path}")

# 3. Update slugAliasMap in all 34 custom element files to map 'careers' -> 'about#careers'
old_alias_block = """      const slugAliasMap = {
        'biosafety': 'hover-biosafety',
        'living-heritage': 'hover-living'
      };"""

new_alias_block = """      const slugAliasMap = {
        'biosafety': 'hover-biosafety',
        'living-heritage': 'hover-living',
        'careers': 'about#careers'
      };"""

all_js = glob.glob(r"wix-repo\src\public\**\*.js", recursive=True)
alias_count = 0
for jf in all_js:
    with open(jf, "r", encoding="utf-8") as f:
        c = f.read()
    if old_alias_block in c:
        c = c.replace(old_alias_block, new_alias_block)
        with open(jf, "w", encoding="utf-8") as f:
            f.write(c)
        alias_count += 1

print(f"Updated slugAliasMap in {alias_count} JS files.")
