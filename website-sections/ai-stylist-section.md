# AI Stylist Section Spec

## File Reference
- Template: `wig_ai_studio/templates/index.html` (`#ai-stylist`)
- Script: `wig_ai_studio/static/js/app.js`

## Purpose
Collect profile information (avatar, head circumference, budget, scene preferences) and turn it into explainable AI recommendations.

## Core Content
- Form title: `AI 发型师`
- Fields:
  - avatar upload
  - head circumference
  - face shape
  - budget min/max
  - scenes, styles, colors
  - comfort and maintenance sliders
  - cosplay intent toggle
- Actions:
  - `AI分析头像`
  - `生成推荐`

## Interaction Rules
- Avatar upload should update `state.avatarBase64`.
- Avatar analysis writes insight copy into `#insightBox`.
- Recommendation action:
  - requests `/api/ai/recommend`
  - updates storefront cards to recommendation mode
  - requests `/api/ai/tryon-plan` to populate scenario cards

## Quality Bar
- Form remains readable on mobile.
- Inputs are grouped to keep perceived complexity low.
