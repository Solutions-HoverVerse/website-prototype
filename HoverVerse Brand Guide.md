# HoverVerse — Brand & Design System

A single reference for recreating the HoverVerse web brand. Direction:
**clinical · premium · high-contrast light.** Philosophy: **"Big · Fast · Easy"**
(displays that are easy to understand, respond faster than the eye can perceive,
and scale to almost any size).

Hard constraints carried through the whole system:
- **Self-contained** — no external fonts, no CDNs. System fonts only.
- **No flashing/strobe** motion (accessibility); honor `prefers-reduced-motion`.
- Strict spatial vocabulary (see Voice below).

---

## 1. Names, marks & trademarks

### Company
- **Legal entity:** HoverVerse AI Inc. — a Texas C-Corporation.
- **Brand name:** HoverVerse (camel-case "V"; never "Hoververse" or "HOVERVERSE" in body copy).
- **Disclaimer (small, low-emphasis in footer):** "Not affiliated with Hoyoverse."

### Product hierarchy (three layers)
| Layer | Name | Role |
|-------|------|------|
| 01 | **SurfaceWare™** | Computer Vision Engine — the UI layer that differentiates Hover OS from GUI-based operating systems |
| 02 | **Hover OS** | Lightweight low-voltage edge operating system |
| 03 | **SurfaceWare Central** | Zero-trust enterprise fleet-management portal |

### Solution lines
- **Living Heritage™** — museums & public venues (modules: Engage · Guide · Extend)
- **Hover SR™** — Sentient Retail (analytics + touchless interactive commerce)
- **Hover Health™** — clinical touchless workstations
- **Biosafety & Cleanrooms** — sterile controlled environments (no ™ / sub-brand yet)
- **Burn Recovery & Physical Therapy** — rehabilitation (no ™ / sub-brand yet)

### Trademark usage
- ™ on first/prominent use of: SurfaceWare™, Living Heritage™, Hover SR™, Hover Health™.
- "Hover OS" and "SurfaceWare Central" carry **no** ™ mark.
- Footer trademark line: "SurfaceWare™, Hover OS, Living Heritage™, Hover SR™ and Hover Health™ are trademarks of HoverVerse."

### Logo & name-mark assets (in `assets/`)
| File | Use |
|------|-----|
| `HV_Logomark_Horizontal_Dark.svg` | Header lockup (glyph + wordmark) on **light** backgrounds |
| `HV_Logomark_Horizontal_Light.svg` | Footer lockup on **dark** backgrounds |
| `HV_Glyph_Dark.png` | Favicon; glyph-only on light |
| `HV_Glyph_Light.png` | Glyph watermark on dark (e.g. CTA band, ~6% opacity) |
| `HV_Wordmark_Dark.svg` | Wordmark-only, dark |
| `HV_Wordmark_Light.png` | Wordmark-only, light |

- Glyph = faceted isometric hexagonal cube. Header lockup renders at **32px** tall
  (30px in footer). Keep clear space ≈ the glyph height on all sides.
- The logo must never be recolored, stretched, or shrunk to zero width
  (`flex: none` in flex containers).

---

## 2. Color palette

Core brand is just three colors — **green `#12A06A`**, **ink `#10151B`**,
**paper `#F7F9FB`** — plus a slate/line gray scale.

### Accent — spatial interaction green
| Token | Value | Use |
|-------|-------|-----|
| `--green` | `#12A06A` | Primary accent, buttons, links, eyebrows |
| `--green-deep` | `color-mix(in oklab, var(--green) 80%, #000)` ≈ `#0E8055` | Hover/pressed, text on tint |
| `--green-bright` | `color-mix(in oklab, var(--green) 72%, #fff)` ≈ `#5BC499` | Accent on dark bands |
| `--green-soft` | `color-mix(in oklab, var(--green) 14%, #fff)` ≈ `#E4F4EE` | Tint fills, soft chips |
| `--green-line` | `color-mix(in oklab, var(--green) 32%, #fff)` ≈ `#B9E1D2` | Tint borders |
| (raw) | `#2DD68C` / `rgba(45,214,140,…)` | Canvas gridlines, glow effects |

> The four derived greens use `color-mix` off `--green`, so changing the one
> primary hex re-tints the whole system. Approx hexes given for tools without color-mix.

### Neutrals — architectural white & slate
| Token | Value | Use |
|-------|-------|-----|
| `--white` | `#FFFFFF` | Cards, header when stuck |
| `--paper` | `#F7F9FB` | Page background |
| `--paper-2` | `#EEF2F6` | Alternating section band |
| `--ink` | `#10151B` | Primary text (near-black slate) |
| `--slate` | `#232C36` | Strong secondary text |
| `--slate-2` | `#3A4654` | Nav links, table labels |
| `--muted` | `#5B6776` | Body / muted text |
| `--faint` | `#8A97A6` | Captions, eyebrow-mono, meta |
| `--line` | `#E1E7ED` | Standard borders |
| `--line-2` | `#D2DAE2` | Stronger borders |

### Dark bands (for contrast/rhythm)
| Token | Value | Use |
|-------|-------|-----|
| `--dark` | `#0E141B` | Dark section / footer bg |
| `--dark-2` | `#131C26` | Dark card bg |
| `--dark-line` | `rgba(255,255,255,0.10)` | Borders on dark |
| `--on-dark` | `#EAF1F7` | Text on dark |
| `--on-dark-mut` | `#9DACBC` | Muted text on dark |
| Gradient stops | `#15202C`, `#090D12`, `#1A2531`, `#0C1219`, `#15212C`, `#0A0F15`, `#1A2733`, `#0E151C` | Stage/hero/CTA radial gradients |

### Divi overlay (internal design aid only — NOT part of public palette)
`#6366F1` indigo (rows), `#EA8E1E` amber (modules), green sections. Hidden by
default; revealed with `?divi=1` or `#divi`.

---

## 3. Typography

**System fonts only** (no web fonts by constraint).

| Token | Stack |
|-------|-------|
| `--sans` | `system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif` |
| `--mono` | `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace` |

- **Sans** — all headings and body.
- **Mono** — eyebrows, labels, meta, code, matrix headers, HUD readouts
  (uppercase, letter-spaced).

### Type scale (fluid, all multiplied by `--type-scale`, default 1)
| Class | Size (clamp) | Weight | Letter-spacing |
|-------|--------------|--------|----------------|
| `.h-display` | `clamp(46px, 6.4vw, 86px)` | 760 | -0.04em |
| `.h-1` | `clamp(40px, 5.2vw, 68px)` | 740 | -0.035em |
| `.h-2` | `clamp(32px, 4vw, 52px)` | 720 | -0.03em |
| `.h-3` | `clamp(22px, 2.3vw, 28px)` | 680 | -0.02em |
| `.lead` | `clamp(19px, 1.65vw, 23px)` | 420 | — (line-height 1.5) |
| `.subhead` | `clamp(18px, 1.55vw, 22px)` | 600 | -0.01em (green) |
| body | `18px` (17px ≤640px) | 400 | line-height 1.6 |
| `.eyebrow` | `13px` mono | 600 | 0.16em, uppercase, green |

Headings are heavy (720–760) and tightly tracked — the "Big" in Big/Fast/Easy.

---

## 4. Spacing, radius & motion tokens

| Token | Value |
|-------|-------|
| `--maxw` | `1240px` (content max width) |
| `--gut` | `40px` (22px on ≤640px) |
| `--r-sm` / `--r-md` / `--r-lg` / `--r-xl` | `10px` / `16px` / `22px` / `30px` |
| `--r-pill` | `999px` |
| `--ease` | `cubic-bezier(.22,.7,.3,1)` |
| Section padding | `clamp(80px, 9vw, 132px)` block (`.section`) |
| Buttons | min-height **58px** (`.btn`), **64px** (`.btn--lg`); pill radius |

Motion: reveal-on-scroll (opacity + 24px translateY, `--ease`), hover lifts of
2–6px. All disabled under `prefers-reduced-motion`. No strobing/flashing.

---

## 5. Core components

- **Buttons:** `.btn` + `.btn--primary` (green fill, white text), `.btn--outline`
  (white bg / line border, green on hover), `.btn--lg`. Pill-shaped, arrow `.arr`
  slides on hover.
- **Bands:** default paper; `.band-paper2` (alt gray); `.band-dark` (dark, inverts
  text tokens). Alternate light/dark for rhythm — **max 1–2 dark bands per page.**
- **Cards:** `.suite` (image + blurb, used for solution cards), `.hygiene-card`
  (icon + text row; can be an `<a>`), `.layer` (product-stack row), `.metric`
  strip, `.compare` table, `.matrix` (vertical-integration mapping table).
- **Eyebrow:** mono uppercase green kicker with a short leading rule.
- **Icons:** inline SVG, 1.6–1.8 stroke, `currentColor`. No emoji.
- **Section header:** `.sec-head` (+`.center`) = eyebrow → h2 → lead.

---

## 6. Voice & spatial vocabulary

Break from screen-centric language. **Use:** interaction field, detection zone,
SurfaceWare, aim / hold / commit / traverse, interactive surface, heads-up,
point-of-intent, commit.
**Avoid:** click, scroll, button (as a verb), touchscreen, kiosk, cursor, "the Field"
used before the interaction field is established.

- "the Field" is only acceptable as a contraction of "interaction field" **after**
  it's been introduced; current copy prefers "interaction field" / "SurfaceWare."
- No unvalidated statistics. Prefer defensible comparatives and cited facts
  (e.g. HAI "1 in 31" is CDC-attributed). Compliance claims (21 CFR Part 11,
  ISO/IEC 17025) must be substantiable before publishing.

### Canonical gesture lexicon (per the SurfaceWare Vocabulary manifesto)
Canonical trio: **Aim → Hold → Commit**, with **Traverse** as the fourth (scrolling).
This is authoritative and supersedes the pitch deck's "aim, hover, commit, sweep."

| Verb | Meaning | Replaces |
|------|---------|----------|
| **Aim** | move the point-of-intent toward a target | point / cursor |
| **Hold** | stabilize over a target to signal attention | mouse-over / rest finger |
| **Commit** | deliberate depth-confirmed action | click / tap |
| **Traverse** | continuous movement through content | scroll / swipe |
| Modulate | adjust a parameter smoothly | drag / slider |
| Acquire / Probe / Reveal / Engage / Disengage | targeting & object states | — |

- Nouns: **Field / interaction field** (3D volume above a surface), **reference plane**,
  **target**, **proximity marker** (external name for the "Bubble Blob" / focus point).
- One-line de-anchor: "Users aim, hold and commit in open air; SurfaceWare converts
  those spatial intents into standard interface events."

### Product / IP lexicon (from the investor deck)
- **SurfaceWare Analysis Pipeline** — patented deep-tech core (SSV, Kalman, Homography).
- **Refractor** — auto-translates flat 2D app layouts into 3D gesture-optimized formats, no rebuild.
- **Hybrid VLA** — deterministic hand tracking (~90 FPS) + heavier VLA scene/object model (<10 FPS).
- **Hover SR / Sentient Retail** — physical surfaces become the interface + analytics.
- **Clinical Gesture Companion** — ambient voice scribe paired with gesture confirmation.
- **WOW** — Workstation on Wheels (healthcare beachhead surface).
- Hardware: **RealSense depth camera** (never "Intel RealSense" — now independent; never "optical array").

### Hover Health messaging discipline (from the Web Copy Guide)
Lead with **workflow infrastructure**, not hardware or infection control. Signature frame:
*ambient AI solved documentation; Hover Health solves the physical-interaction half.*
Infection/contamination stays a **supporting** benefit, not the headline.

| Use more of | Use less of (demote to backend) |
|-------------|--------------------------------|
| Clinical workflow modernization | spatiotemporal tokens |
| Reduced friction / administrative drag | kinetic inference |
| Touchless clinical infrastructure | mobile fomite |
| Physical interaction layer | skeletal telemetry (as a lead) |
| "Capturing the invisible middle" | pathogen vector (as the lead) |
| Retrofit / low-disruption overlay | deterministic depth vision (as a lead) |
| Compliance-conscious deployments | "HIPAA-compliant" (unless validated) |

**HIPAA rule:** never claim "HIPAA-compliant / certified / guaranteed." Mandated phrasing:
"Designed for compliance-conscious healthcare deployments," "Privacy-first architecture
for the clinical workspace," "Built for controlled clinical environments and governance frameworks."
**EHR:** position as a low-disruption overlay on Epic (Hyperdrive/Haiku), Oracle Health/Cerner
(PowerChart) and MEDITECH — no rip-and-replace. **Beachhead weighting:** Healthcare 70% ·
Controlled environments 20% · Public spaces 10%.

---

## 7. File / project structure

```
index.html          Homepage
solutions.html      Solutions (Living Heritage, Hover SR, Hover Health,
                    Biosafety & Cleanrooms, Burn Recovery & Rehab)
styles.css          All tokens + component styles
app.js              Interactions (hero video, reveals, nav, Divi overlay)
tweaks-app.jsx      Tweaks panel contents
tweaks-panel.jsx    Tweaks framework
assets/             Logos, wordmarks, glyphs, hero video
```

Pages are Divi-structured: every block tagged `data-divi="section|row|module"`
with a human label, so the design maps 1:1 onto Divi Section → Row → Module.
