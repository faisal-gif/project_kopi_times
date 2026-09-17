# Design: Landing Kopi TIMES

Scope: public pages `Welcome/*`, `Tentang/Index.jsx`, `Harga/Index.jsx` (Harga reuses `PricingSection` + `FeatureSection`; Tentang reuses `AboutSection`). Fonts load in `LandingLayout`. The dashboard and the other pages still use the daisyUI `times` theme. The shared `LandingLayout` navbar and footer are out of scope.

## World: naskah & tinta merah redaksi

The page reads like an opinion manuscript being edited by an editor: a typed sheet on the red desk of TIMES, corrected in red pen and marked with a saffron highlighter. It refuses the centered SaaS hero and the same-size icon cards.

## Tokens (`resources/css/app.css`, `@theme`)

| Token | Value | Role |
|---|---|---|
| `desk` | `#8a0b10` | red desk field: hero, pricing section |
| `sheet` | `#fcfcfa` | manuscript sheet, package slips, benefits section |
| `paper` | `#f3f2ee` | page ground |
| `ink` | `#1b1a19` | text, dark testimonial band, secondary buttons |
| `pen` | `#b30d12` | editor marks, primary buttons, criterion titles |
| `saffron` | `#fbb40a` | highlighter, tape strips, focus ring, selection, labels |

Only these inks. No gradients, glass, or decorative greys.

## Type

- `font-print` Archivo 800–900: headings, prices, buttons. Tracking -0.025em to -0.03em.
- `font-type` Courier Prime: body text, criteria, steps, metadata (the typed manuscript).
- `font-pen` Kalam: red-pen marks only (criterion titles, margin notes, the headline insertion, captions).
- Loaded from fonts.bunny.net through `<Head>` in `LandingLayout.jsx`.
- Values/stamps (Tentang): pen-red 3px border, uppercase Archivo black, rotation ±1–3°.

## Components and materials

- Sheet: `rounded-[3px]`, soft offset shadow `0 30px 60px -20px`, slight rotation on lg.
- Tape strip: a `bg-saffron/85` bar rotated ±3–6° over a pinned image.
- Dashed rule: `.kt-rule` or `border-dashed` as the dividers between typed items.
- Primary button: `bg-pen` white text Archivo extrabold, radius 3px, arrow that shifts on hover. Secondary: underlined link with a `decoration-pen` underline.
- Hand-drawn SVG: the headline strike (`.kt-strike`) and the underline under each criterion.

## Motion

One authored moment in the hero: the pen strike draws (0.35s), the handwritten insertion is written in via clip-path (0.85s), then the highlighter sweeps (1.5s). Exponential ease-out. Turned off under `prefers-reduced-motion`.

## Content rules

The only stats are 10K+ artikel, 5K+ penulis, 1M+ pembaca, set as footnotes on the sheet. The testimonials are the 8 original images from the CDN. The member card and photo frame are real assets, with placeholder "Nama Anda" / "foto Anda".
