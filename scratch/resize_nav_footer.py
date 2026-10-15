import os
import re

header_files = [
    'wix-repo/src/public/hoververse-header.js',
    'wix-repo/src/public/custom-elements/hoververse-header.js'
]

footer_files = [
    'wix-repo/src/public/hoververse-footer.js',
    'wix-repo/src/public/custom-elements/hoververse-footer.js'
]

# Update hoververse-header.js files
for hf in header_files:
    if not os.path.exists(hf):
        continue
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update .brand svg in header
    old_brand_css = '''.brand svg {
          height: 32px;
          width: auto;
          display: block;
        }'''
    new_brand_css = '''.brand svg, .brand .logo {
          height: 28px !important;
          width: 142px !important;
          max-width: 142px !important;
          aspect-ratio: 690 / 136;
          display: block !important;
          flex: none;
        }'''
    content = content.replace(old_brand_css, new_brand_css)

    # 2. Update .nav gap and padding
    content = content.replace(
        'padding: 16px var(--gut);\n          display: flex;\n          align-items: center;\n          justify-content: space-between;\n          gap: 28px;',
        'padding: 16px var(--gut);\n          display: flex;\n          align-items: center;\n          justify-content: space-between;\n          gap: 24px;'
    )

    # 3. Update .nav-links gap and font-size
    content = content.replace(
        '.nav-links {\n          display: flex;\n          align-items: center;\n          gap: 28px;',
        '.nav-links {\n          display: flex;\n          align-items: center;\n          gap: 26px;'
    )
    content = content.replace(
        '.nav-links a {\n          font-size: 16px;',
        '.nav-links a {\n          font-size: 15px;'
    )

    # 4. Update .btn padding and min-height
    content = content.replace(
        'font-size: 15px;\n          min-height: 46px;\n          padding: 0 20px;',
        'font-size: 14px;\n          min-height: 44px;\n          padding: 0 18px;'
    )

    # 5. Update intermediate media query
    old_mq = '''.nav-links { gap: 18px; }
          .nav-links a { font-size: 14px; }
          .nav-cta { gap: 8px; }
          .nav-cta .btn { padding: 0 15px; font-size: 13.5px; min-height: 42px; }'''
    new_mq = '''.brand svg, .brand .logo { height: 24px !important; width: 122px !important; max-width: 122px !important; }
          .nav { gap: 14px; padding: 12px var(--gut); }
          .nav-links { gap: 16px; }
          .nav-links a { font-size: 13.5px; }
          .nav-cta { gap: 8px; }
          .nav-cta .btn { padding: 0 13px; font-size: 13px; min-height: 38px; }'''
    content = content.replace(old_mq, new_mq)

    # 6. Remove width="690" height="136" from <svg>
    content = content.replace(
        '<svg width="690" height="136" viewBox="0 0 690 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hoververse">',
        '<svg viewBox="0 0 690 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hoververse" class="logo">'
    )

    with open(hf, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated header file: {hf}")

# Update hoververse-footer.js files
for ff in footer_files:
    if not os.path.exists(ff):
        continue
    with open(ff, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update .footer .brand svg
    old_f_brand = '''.footer .brand svg {
          height: 30px;
          width: auto;
          display: block;
        }'''
    new_f_brand = '''.footer .brand svg, .footer .brand .logo {
          height: 26px !important;
          width: 132px !important;
          max-width: 132px !important;
          aspect-ratio: 690 / 136;
          display: block !important;
          flex: none;
        }'''
    content = content.replace(old_f_brand, new_f_brand)

    # 2. Update .footer padding and grid gap
    content = content.replace(
        '.footer {\n          background: var(--dark);\n          color: var(--on-dark);\n          padding-block: 70px 38px;',
        '.footer {\n          background: var(--dark);\n          color: var(--on-dark);\n          padding-block: 60px 36px;'
    )
    content = content.replace(
        '.footer-top {\n          display: grid;\n          grid-template-columns: 1.3fr 1fr 1fr 1fr 1fr;\n          gap: 40px;\n          margin-bottom: 52px;',
        '.footer-top {\n          display: grid;\n          grid-template-columns: 1.3fr 1fr 1fr 1fr 1fr;\n          gap: 36px;\n          margin-bottom: 48px;'
    )

    # 3. Update blurb and h5
    content = content.replace(
        '.footer .blurb {\n          color: var(--on-dark-mut);\n          font-size: 15px;\n          max-width: 36ch;',
        '.footer .blurb {\n          color: var(--on-dark-mut);\n          font-size: 14.5px;\n          max-width: 32ch;'
    )
    content = content.replace(
        '.footer h5 {\n          font-family: var(--mono);\n          font-size: 12px;\n          letter-spacing: 0.12em;\n          text-transform: uppercase;\n          color: var(--faint);\n          margin: 0 0 18px;',
        '.footer h5 {\n          font-family: var(--mono);\n          font-size: 12px;\n          letter-spacing: 0.12em;\n          text-transform: uppercase;\n          color: var(--faint);\n          margin: 0 0 16px;'
    )
    content = content.replace(
        '.footer ul {\n          list-style: none;\n          margin: 0;\n          padding: 0;\n          display: grid;\n          gap: 12px;',
        '.footer ul {\n          list-style: none;\n          margin: 0;\n          padding: 0;\n          display: grid;\n          gap: 11px;'
    )
    content = content.replace(
        '.footer ul a {\n          color: var(--on-dark-mut);\n          font-size: 15px;',
        '.footer ul a {\n          color: var(--on-dark-mut);\n          font-size: 14.5px;'
    )
    content = content.replace(
        '.footer-bot {\n          display: flex;\n          align-items: center;\n          justify-content: space-between;\n          gap: 20px;\n          padding-top: 28px;',
        '.footer-bot {\n          display: flex;\n          align-items: center;\n          justify-content: space-between;\n          gap: 20px;\n          padding-top: 24px;'
    )

    # 4. Remove width="690" height="136" from <svg>
    content = content.replace(
        '<svg width="690" height="136" viewBox="0 0 690 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hoververse">',
        '<svg viewBox="0 0 690 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hoververse" class="logo">'
    )

    with open(ff, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated footer file: {ff}")

print("Header and footer standalone elements resized successfully.")
