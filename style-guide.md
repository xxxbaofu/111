# WigVerse AI — High-End Style Guide (SSOT)

This document is the single source of truth for visual language and interaction behavior.
Direction: **dark / neon / premium** with restrained luxury.  
Reference quality: **Apple, Stripe, high-end fashion e-commerce**.  
Anti-goal: anything that feels noisy, gamer-ish, or cheap cyberpunk.

---

## 1) Color System

### 1.1 Core Tokens

#### Brand / Action
- `Primary / Aurora Violet`: `#7B61FF`
- `Secondary / Luxe Indigo`: `#4C3A9E`
- `Accent / Electric Rose`: `#FF5FA0`

#### Utility
- `Success`: `#2DD4BF`
- `Warning`: `#F59E0B`
- `Danger`: `#F43F5E`
- `Info`: `#60A5FA`

### 1.2 Background Layers (critical)

Use layered surfaces, never a flat single-color canvas.

- `BG-0 (Global)`: `#0A0911`
- `BG-1 (Section Surface)`: `#121020`
- `BG-2 (Raised Card)`: `#17142A`
- `BG-Glass (Overlay/Nav)`: `rgba(18, 16, 32, 0.72)` + blur
- `Border Soft`: `rgba(255, 255, 255, 0.10)`
- `Border Strong`: `rgba(255, 255, 255, 0.18)`

### 1.3 Glow Usage Rules (very important)

Glow exists only to support hierarchy, not to decorate.

- **Where allowed**:
  - Primary CTA focus/hover halo
  - Hero highlight edge
  - One accent marker in try-on output area
- **Glow spec**:
  - Radius: 12–28px
  - Opacity: 0.12–0.24 max
  - Never stack two colored glows on one element
- **Frequency cap**:
  - Max 1 glow focal point per viewport section

### 1.4 What NOT to do

- Do not use rainbow/multi-neon gradients.
- Do not put saturated gradients behind long text blocks.
- Do not color every card with accent tints.
- Do not use pure black + pure neon combinations that reduce readability.
- Do not make secondary actions glow like primary CTAs.

---

## 2) Typography

Tone: short, editorial, premium, direct.  
Avoid generic SaaS filler copy.

### 2.1 Hierarchy (H1–H5)

- `H1`: 52 / 58, weight 700, letter-spacing `-0.02em`
- `H2`: 36 / 42, weight 650, letter-spacing `-0.015em`
- `H3`: 28 / 34, weight 600, letter-spacing `-0.01em`
- `H4`: 22 / 30, weight 600, letter-spacing `-0.005em`
- `H5`: 18 / 26, weight 600, letter-spacing `0`

### 2.2 Body & Meta

- `Body-L`: 18 / 30, weight 400
- `Body-M`: 16 / 28, weight 400
- `Body-S`: 14 / 22, weight 400
- `Meta`: 12 / 18, weight 500, letter-spacing `0.04em`

### 2.3 Copy Tone Rules

- Prefer statement-led copy: “30秒完成选款判断”
- Keep hero paragraph <= 2 lines desktop, <= 3 lines mobile.
- One section = one promise.
- Avoid adjectives pile-up (“智能/高效/专业/领先” in one sentence).

---

## 3) Component System

Keep component library minimal. **2–3 card variants only**.

### 3.1 Cards (max 3 variants)

1. **Card / Primary Surface**
   - For hero and key conversion blocks
   - BG-2 + soft border + subtle shadow
2. **Card / Neutral Content**
   - For store, reviews, newsletter
   - BG-1 + soft border
3. **Card / Utility Panel**
   - For cart, try-on controls, insights
   - BG-1 + strong border + slight inset highlight

### 3.2 Buttons

- **Primary**:
  - Solid Aurora Violet
  - Hover: +4% brightness, subtle glow
  - Purpose: one per section (max two in hero)
- **Secondary**:
  - Transparent / dark with strong border
  - Hover: border brighten + background tint
  - Never visually compete with primary

### 3.3 Input Fields (glass/dark UI)

- Dark glass fill: `rgba(255,255,255,0.03–0.06)`
- Border: soft neutral
- Focus: 1px primary border + tiny outer halo
- Placeholder contrast must remain readable (not washed out)

### 3.4 Tags / Chips

- Rounded pill with neutral background
- One accent chip type for status only (e.g., cosplay)
- Keep chip copy 1–2 words; avoid sentence chips

---

## 4) Spacing System

### 4.1 8px Grid

Base unit: `8px`

- `4` (micro adjustment only)
- `8`, `16`, `24`, `32`, `40`, `48`, `64`, `80`

### 4.2 Section Spacing Rules

- Section-to-section vertical: `64–80px`
- Card internal padding: `24px` desktop / `16px` mobile
- Between heading and body: `12–16px`
- Between body and CTA: `24px`

### 4.3 Max Content Width

- Global container: `1200px` max
- Hero text column: `560px` max readable width
- Form-heavy sections: never exceed 2-column content density

---

## 5) Motion & Interaction

Premium motion is invisible until needed.

### 5.1 Hover Rules

- Card hover: `translateY(-2px)` max
- Shadow delta: soft only
- No bouncing or elastic effects

### 5.2 Transition Speed

- Fast: `120ms` (input, toggles)
- Standard: `180ms` (buttons, cards)
- Long: `240ms` (overlay/panel)
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`

### 5.3 Micro-interactions (subtle only)

- CTA press depth (1–2px)
- Toast fade/slide micro-entry
- Loading label swap on async actions
- Smooth anchor scroll allowed, parallax not allowed

---

## 6) Minimalism Enforcement

- If a section needs explanation, remove visual noise before adding content.
- Maximum 2–3 primary visual elements per section.
- Every element must map to: conversion, trust, or clarity.
- If it looks like a template, simplify and tighten hierarchy.

---

## 7) Implementation Mapping

- Template layer: `wig_ai_studio/templates/index.html`
- Theme and tokens: `wig_ai_studio/static/css/style.css`
- Interaction logic: `wig_ai_studio/static/js/app.js`
