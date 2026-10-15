import os

# Read header snippet from hoververse-header.js
with open('wix-repo/src/public/hoververse-header.js', 'r', encoding='utf-8') as f:
    header_content = f.read()

h_start = header_content.find('<header class="site-header">')
h_end = header_content.find('</header>') + len('</header>')
header_html = header_content[h_start:h_end]

# Read footer snippet from hoververse-footer.js
with open('wix-repo/src/public/hoververse-footer.js', 'r', encoding='utf-8') as f:
    footer_content = f.read()

f_start = footer_content.find('<footer class="footer">')
f_end = footer_content.find('</footer>') + len('</footer>')
footer_html = footer_content[f_start:f_end]

embed_path = 'wix-assets/wix-home-embed.html'
with open(embed_path, 'r', encoding='utf-8') as f:
    html = f.read()

if '<header class="site-header">' not in html:
    # Insert header right before <main>
    html = html.replace('<main>', header_html + '\n<main>')
    # Insert footer right after </main>
    html = html.replace('</main>', '</main>\n' + footer_html)

    # Insert interaction js before </script>
    nav_script = '''
  // Site-wide header & footer interaction logic
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var dropItems = document.querySelectorAll('.nav-item.has-dropdown');
  var demoBtn = document.querySelector('.demo-btn');
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  if (header) {
    var onScroll = function() {
      header.classList.toggle('is-stuck', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function() {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    document.querySelectorAll('.nav-links a').forEach(function(a) {
      a.addEventListener('click', function() {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  dropItems.forEach(function(dropItem) {
    var dropToggle = dropItem.querySelector('.nav-drop-toggle');
    if (!dropToggle) return;
    dropToggle.setAttribute('aria-expanded', 'false');

    dropToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var willOpen = !dropItem.classList.contains('open');

      dropItems.forEach(function(other) {
        if (other === dropItem) return;
        other.classList.remove('open');
        var otherToggle = other.querySelector('.nav-drop-toggle');
        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
      });

      dropItem.classList.toggle('open', willOpen);
      dropToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function(e) {
    var isInsideNav = false;
    dropItems.forEach(function(d) {
      if (d.contains(e.target)) isInsideNav = true;
    });
    if (!isInsideNav) {
      dropItems.forEach(function(d) {
        d.classList.remove('open');
        var t = d.querySelector('.nav-drop-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });
'''
    pos = html.rfind('})();')
    if pos != -1:
        html = html[:pos] + nav_script + '\n' + html[pos:]

    with open(embed_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated wix-home-embed.html successfully")
else:
    print("wix-home-embed.html already has header")
