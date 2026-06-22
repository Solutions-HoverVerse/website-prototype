# Hoververse Website — Scaffold

Working scaffold for the Hoververse marketing site. Self-contained and ready
for more edits, additions, and tweaks.

## Open it
Open `index.html` in a browser. No build step required.

## Files
- `index.html` ............ Homepage (Divi-tagged).
- `solutions.html` ........ Solutions page: Living Heritage, Hover SR (retail),
                            Hover Health (healthcare).
- `styles.css` ........... All styles + design tokens (`:root` variables:
                            colors, type scale, spacing, radii).
- `app.js` ............... Interactions: hero projected-wall demo, scroll
                            reveals, mobile nav, Divi overlay. Vanilla JS.
- `tweaks-app.jsx` ....... The Tweaks panel contents (accent, heading scale,
                            heads-up label, reduce-motion). Edit defaults here.
- `tweaks-panel.jsx` ..... Tweaks framework (don't usually need to touch).
- `assets/` .............. Official HoverVerse logos, wordmarks, glyphs.

## Editing notes
- Brand colors / fonts / spacing live as `--*` tokens at the top of styles.css.
- Copy edits: search index.html for the text; it's plain semantic HTML.
- To rebuild in Divi: follow the on-screen Section/Row/Module labels.

## Still to do (placeholders)
- Living Heritage cards use placeholder imagery — drop real photography into
  `assets/` and swap the `.ph-photo` blocks in index.html.
- Inner pages (SurfaceWare, Hover OS, Living Heritage, SurfaceWare Central)
  not yet built.

A dark-theme v1 of the homepage is kept at the project root:
`Hoververse Home v1 (dark).html`.
