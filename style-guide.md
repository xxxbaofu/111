# WigVerse AI Style Guide

This guide is the single source of truth for visual and interaction decisions across the WigVerse AI storefront project.

## 1) Color Palette

The project uses a dark-premium visual language with high contrast CTAs and subtle neon accents.

### Core Brand Colors

- `#6f42c1` (Primary Purple)
  - Usage: Primary buttons, key interactive states, accent backgrounds, hero highlights.
  - Avoid: Large text paragraphs.
- `#d63384` (Magenta Accent)
  - Usage: Secondary accent, gradient stops, attention markers.
  - Avoid: Body text.
- `#20c997` (Success Mint)
  - Usage: Success toasts, confirmation indicators, positive states.
- `#fd7e14` (Warm Highlight)
  - Usage: Warning emphasis, limited decorative accents.

### Surface and Background Colors

- `#0f0b1d` to `#17102f` family (Dark surfaces)
  - Usage: Global page background, hero surfaces.
- `rgba(23, 16, 44, 0.85)` (Glass nav)
  - Usage: Sticky nav with blur.
- `rgba(255, 255, 255, 0.04-0.14)` (Layered borders and soft panels)
  - Usage: Card boundaries, metric boxes, overlays.

### Semantic Colors

- Success: `#20c997` + Bootstrapped success variants.
- Warning: `#fd7e14` + warning text variants.
- Error: Bootstrap danger scale (`text-bg-danger`, `#dc3545` family).

### Color Usage Guidance

- Keep long-form text at high readability contrast (light text on dark background).
- Use saturated colors only for actions and highlights, never as full-page fills.
- Ensure CTA hierarchy:
  - Primary CTA = solid purple
  - Secondary CTA = outline light
  - Tertiary utility = neutral outline

---

## 2) Typography Scale

Typography is based on Bootswatch Lux defaults with semantic scale control.

### Font Stack

- Primary: system font stack from Bootswatch Lux
- Fallback strategy: keep defaults for performance and consistency

### Type Scale

- Hero Title: `display-6` / ~2.5rem desktop, responsive down on mobile
- Section Titles: `h4` / ~1.5rem
- Subsection Titles: `h5`/`h6`
- Body Text: default paragraph size (~1rem)
- Secondary Body: `small` + muted text
- Meta Labels: uppercase small tags for step labels

### Typography Guidance

- Maximum hero paragraph width should remain short for quick scan.
- Never use more than two emphasis levels inside one block.
- Prefer semantic heading structure (`h1` -> `h2` -> `h3`) for accessibility and SEO.

---

## 3) Component Styles

## Buttons

- Primary: `btn btn-primary`
- Secondary: `btn btn-outline-light` / `btn btn-outline-secondary`
- Utility small buttons: `btn-sm`
- Loading behavior:
  - Button text swap to action-in-progress copy.
  - Disabled state must block duplicate requests.

### Cards

- Use Bootstrap cards with subtle shadow and border (`shadow-sm`, `border-secondary-subtle`).
- Card body padding baseline: `1.3rem`.
- Related content should be grouped by section cards, not flat div blocks.

### Badges / Pills

- Value tags: rounded pills for fast visual parsing.
- Use info/neutral tones for metadata.
- Use warning accents only for exceptional tags (e.g. cosplay flag).

### Forms

- Inputs: `form-control`, Selects: `form-select`, toggles with `form-check`.
- Use concise labels; helper text only when required.
- Keep filter controls in one row on desktop and stacked on mobile.

### Toasts

- Global toast container for success/warning/error feedback.
- Auto-dismiss around 2.2s.
- Do not stack more than one visible toast state at once.

### Try-On Gallery

- Use fixed image card heights for visual consistency.
- Always include scene label + provider metadata below generated image.

---

## 4) Spacing System

Use an 8px rhythm mapped via Bootstrap utility classes.

### Base Rhythm

- 4px micro spacing: icon or tiny adjustments only.
- 8px unit: foundational spacing.
- 16px unit: most control gaps (`g-2`, `gap-2`).
- 24px unit: section internal spacing.
- 32px+ unit: major section separation.

### Practical Rules

- Card-to-card vertical gap: at least `mb-4`.
- Form element vertical spacing: `mb-2` to `mb-3` depending on density.
- Hero block spacing should keep CTA visible without scroll on typical desktop.

---

## 5) Animation Guidelines

Animations should reinforce feedback and state change, not decoration.

### Motion Principles

- Fast feedback: 120ms–220ms for hover/press.
- Medium transitions: up to 300ms for panel state changes.
- Avoid long easing chains in core purchase flow.

### Approved Motion

- Hover elevation on cards (subtle shadow/transform).
- Button state transitions (color and disabled state).
- Toast entry/exit using Bootstrap default transitions.
- Optional smooth scroll for anchor navigation.

### Avoid

- Looping non-functional animations near CTA zones.
- Large parallax or motion-heavy effects that hurt readability.
- Complex transforms on form controls.

---

## 6) Accessibility & Consistency Rules

- Maintain contrast ratio for text and interactive controls.
- Keep focus states visible (do not remove focus outlines globally).
- Ensure keyboard-accessible interactions for all actionable controls.
- Use ARIA labels where semantic labels are not self-evident.

---

## 7) Design-System Source Reference

- Theme base: Bootswatch Lux (`bootstrap@5.3.x`)
- Custom visual layer: `wig_ai_studio/static/css/style.css`
- Layout source: `wig_ai_studio/templates/index.html`
