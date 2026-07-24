# DESIGN.md — Loop: Habit Loop Unmasker
# Redesigned to match the warm, premium wellness aesthetic (creams, sunset gradients, soft shadows).

## The feel

A premium, human wellness tool. Inspired by modern, high-end self-care dashboards. It uses warm, inviting color tones, soft drop shadows, generous rounded corners, and clean cards that float above a subtle warm background. The diagram and cards feel alive, polished, and encouraging.

---

## Palette

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| Background | `linear-gradient(135deg, #FFF5EA 0%, #FFFDFB 100%)` | Warm cream/peach background gradient |
| Page Base | `#FDF8F3` | Solid fallback bg |
| Ink | `#2D231D` | Deep warm charcoal/espresso for readable typography |
| Accent | `#F97316` | Warm sunset orange (primary CTA, highlights) |
| Muted | `#A79B92` | Warm secondary labels and chips |
| White | `#FFFFFF` | Card backgrounds, tile backgrounds, node fills |
| Border | `#EFEAE4` | Soft cream border |
| Shadow | `0 8px 30px rgba(223, 195, 175, 0.18)` | Soft, diffused warm shadow for elements |

---

## Typography

Font family: **Space Grotesk** (Google Fonts).

- **Headings / Wordmark**: 700 weight, slightly tracked-in (-0.02em).
- **Subheadings / Stats**: 600 weight, warm ink.
- **Body / Labels**: 400 or 500 weight, high readability (1.6 line-height).

---

## Visual Elements

- **Rounded Corners**: Card and tile border-radius at `16px` for a friendly, modern interface.
- **Node Styling**: White circles with 2px ink borders, styled with soft SVG drop shadows (`filter: drop-shadow`).
- **Interactive Tiles**: Soft white cards that scale down slightly on press (`scale(0.98)`) and feature an active glowing border.
- **Progress Line**: Clean line filling left-to-right at the top.
