# HoverVerse Website

Marketing + investor site for HoverVerse (Hover Touch Technologies Inc. dba HoverVerse AI).
Self-contained static site — no build step.

## Open it
Open `index.html` in a browser, or deploy the folder to any static/WordPress host.

## Pages
- `index.html` ................. Homepage (outcomes-first: hero → Aim/Hold/Commit →
                                 Missing Half → Solutions → Benefits → Platform).
- `solutions.html` ............. Solutions overview + verticals (Living Heritage,
                                 Hover SR retail, Biosafety & cleanrooms, rehab)
                                 with the vertical-integration mapping matrix.
- `hover-health.html` .......... Dedicated Hover Health page (touchless clinical
                                 workflow infrastructure; healthcare beachhead).
- `investors.html` ............ Public investor teaser.
- `investors-confidential.html`  Password-gated confidential materials
                                 (AES-encrypted; payload in the .js below).
- `investors-confidential-payload.js` — encrypted confidential content blob.
- `why-hoververse.html` ....... Physical AI differentiation + heads-up comparison.
- `about.html` ................ Company narrative, who we serve, values, partners.
- `leadership.html` ........... Exec team, board of directors, strategic advisory board.
- `careers.html` .............. Hiring page (role list is ILLUSTRATIVE — replace
                                 with live openings before launch).

## Shared
- `styles.css` ................ All styles + design tokens (`:root` variables).
- `app.js` ................... Interactions: hero video, scroll reveals, mobile
                               nav, Divi structure overlay (enable with `?divi=1`).
- `tweaks-app.jsx` / `tweaks-panel.jsx` — homepage Tweaks panel.
- `assets/` .................. Logos, wordmarks, glyphs, hero video.
- `HoverVerse Brand Guide.md` . Colors, type, logo usage, vocabulary + messaging.

## Notes
- Analytics: Microsoft Clarity is embedded in each page `<head>`.
- Confidential investor page password: managed via encryption — ask the
  maintainer to rotate (requires re-encrypting the payload).
- Trademarks: SurfaceWare™ (U.S. registration pending), Hover OS, Living
  Heritage™, Hover SR™, Hover Health™ — Hover Touch Technologies Inc. dba HoverVerse AI.
- Placeholders remain for photography (`.ph-photo` / `.sol-visual` blocks) —
  drop real images into `assets/` and swap them in.
- To rebuild in Divi: follow the on-screen Section/Row/Module labels.
