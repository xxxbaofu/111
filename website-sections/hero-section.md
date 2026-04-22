# Hero Section Spec

## Section goal
Convey the core value proposition in under 5 seconds: users can discover suitable wigs quickly with AI + 3D visualization + try-on image generation.

## Content blocks
- Value badge: "AI + 3D + 试戴出图"
- Headline: conversion-focused promise
- Supporting paragraph: short explanation of workflow and value
- Value chips: fit matching, cosplay adaptation, real AI generation support
- Primary CTA: go to AI stylist
- Secondary CTA: go to try-on lab
- KPI mini cards: product count, average rating, cosplay ratio
- 3D visual canvas panel with color-switch control

## Interaction requirements
- `#switchWigColorBtn` cycles wig color in canvas.
- CTAs anchor-scroll to target sections.
- KPI values populate from `/api/catalog`.

## Layout
- Desktop: two-column split (copy + visual).
- Mobile: stacked, copy first then visual.

## Accessibility
- Canvas has descriptive `aria-label`.
- Buttons are keyboard focusable with visible focus states.

