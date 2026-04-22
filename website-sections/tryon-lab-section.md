# Try-On Lab Section Spec

## Purpose
Provide a controlled AI image generation workspace where users convert recommendations into visual try-on outputs.

## UX Goals
- Make generation settings understandable for non-technical users.
- Display generated outputs with clear context (scene, provider, selected products).
- Surface integration warnings and fallback behavior transparently.

## Core Content
- Section title: `AI 试戴出图工作台`
- Subcopy: supports mock generation by default, real AI when enabled.
- Controls:
  - image count (`#tryonImageCount`)
  - render style (`#tryonRenderStyle`)
  - image size (`#tryonImageSize`)
  - real AI toggle (`#useRealAiToggle`)
  - generate action (`#generateTryonBtn`)
  - apply recommended products action (`#applyTryonSelectionBtn`)
- Feedback:
  - warnings (`#tryonWarnings`)
  - integration tips (`#tryonIntegrationTips`)
- Result gallery (`#tryonGallery`)

## Data + API Dependencies
- Generation endpoint: `POST /api/ai/tryon-generate`
- Uses profile payload + selected product IDs from recommendation flow.
- Receives:
  - `images[]` (scene, imageUrl, provider, recommendedProductIds)
  - `providerMode`
  - `warnings[]`
  - `integrationTips[]`

## Interaction Requirements
- Show loading state on generate button while request is running.
- Handle `providerMode` transitions (openai/mock).
- Render gallery cards in responsive grid.
- Show warning text in high-visibility style.

## Layout + Responsiveness
- Card container with:
  - control row first
  - CTA row second
  - feedback messages third
  - gallery fourth
- On small screens controls stack one per row.

## Accessibility
- Ensure form controls have labels.
- Provide meaningful alt text for generated images.
- Keep warning text readable with sufficient contrast.
