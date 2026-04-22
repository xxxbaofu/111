# WigVerse AI Project Requirements Document (PRD)

## 1. Project Overview

WigVerse AI is a conversion-focused wig ecommerce landing and storefront that combines:

- Catalog browsing and filtering
- AI-assisted profile-based recommendation
- Try-on planning and image generation
- Cart and checkout preview
- Reviews and newsletter conversion

The product objective is to reduce decision friction for users selecting wigs (daily and cosplay) by making style fit, scene fit, and visual preview immediately actionable.

Primary audience:

- Wig buyers with uncertainty around fit/style
- Cosplay creators requiring scene-accurate wig choices
- Returning users seeking faster checkout decisions

Core conversion flow:
1. Land on hero and understand value proposition
2. Generate recommendation from profile
3. Validate with try-on image output
4. Add to cart and preview checkout
5. Subscribe / return

---

## 2. Tech Stack

Extracted from existing implementation:

### Backend
- Python 3
- Flask (`wig_ai_studio/app.py`)

### Frontend
- Server-rendered HTML (Jinja template in Flask)
- Vanilla JavaScript (`wig_ai_studio/static/js/app.js`)
- CSS with Bootstrap theme overrides (`wig_ai_studio/static/css/style.css`)
- Bootswatch (Lux) + Bootstrap 5.3
- Three.js (`unpkg` CDN) for 3D wig visualization

### AI / Generation Layer
- Internal rule-based recommendation engine (`wig_ai_studio/ai_engine.py`)
- Optional OpenAI image generation integration (`OPENAI_API_KEY`, `gpt-image-1`) with mock fallback

---

## 3. Dependencies

### Python packages (`requirements.txt`)
- flask
- openai
- requests
- pytrends
- apscheduler
- streamlit
- pandas
- pytest

### Frontend runtime libraries (CDN)
- `bootswatch@5.3.3/dist/lux/bootstrap.min.css`
- `bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`
- `three@0.162.0/build/three.min.js`

---

## 4. Design System Reference

- Source of truth: `style-guide.md`
- Section-level implementation references:
  - `website-sections/hero-section.md`
  - `website-sections/store-section.md`
  - `website-sections/ai-stylist-section.md`
  - `website-sections/tryon-lab-section.md`
  - `website-sections/reviews-newsletter-section.md`

The style guide governs color, typography, spacing, motion, and component behavior globally.

---

## 5. Page Sections with File References

Single main page:
- Template: `wig_ai_studio/templates/index.html`

Sections:
1. Hero + value proposition + 3D preview  
   - Spec: `website-sections/hero-section.md`
2. Storefront filters + product cards  
   - Spec: `website-sections/store-section.md`
3. AI Stylist + cart sidebar  
   - Spec: `website-sections/ai-stylist-section.md`
4. Try-on Generation Lab  
   - Spec: `website-sections/tryon-lab-section.md`
5. Reviews + newsletter capture  
   - Spec: `website-sections/reviews-newsletter-section.md`

Supporting files:
- Style: `wig_ai_studio/static/css/style.css`
- Behavior: `wig_ai_studio/static/js/app.js`
- API controller: `wig_ai_studio/app.py`

---

## 6. File Structure

```text
/workspace
├── product-brief.md
├── style-guide.md
├── prd.md
├── tasks.md
├── website-sections/
│   ├── hero-section.md
│   ├── store-section.md
│   ├── ai-stylist-section.md
│   ├── tryon-lab-section.md
│   └── reviews-newsletter-section.md
├── wig_app.py
├── wig_ai_studio/
│   ├── app.py
│   ├── ai_engine.py
│   ├── catalog.py
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── css/style.css
│       ├── js/app.js
│       ├── uploads/      (runtime, gitignored)
│       └── generated/    (runtime, gitignored)
└── tests/
    ├── test_wig_ai_engine.py
    └── test_wig_store_api.py
```

---

## 7. Responsiveness Requirements

### Breakpoints
- Desktop: `>= 1200px`
- Tablet: `768px - 1199px`
- Mobile: `< 768px`

### Requirements
- Hero reorganizes from two-column to stacked on tablet/mobile
- Product and try-on galleries use responsive grid spans
- Form controls in AI stylist and try-on lab stack vertically on small screens
- Cart and checkout remains accessible without horizontal scrolling
- Minimum tap target size: `44px`

---

## 8. Performance Requirements

- First meaningful section render target: <= 2.5s on average 4G conditions (excluding external AI generation time)
- Keep main stylesheet concise; avoid duplicated utility overrides
- Lazy-loading recommendation/try-on outputs through user actions only (no eager heavy rendering)
- Minimize unnecessary re-renders in JS:
  - only re-render affected sections after API responses
- Try-on generation:
  - default max generated images per request: 4
  - always provide mock fallback to avoid hard failure states

Monitoring requirements:
- Track conversion micro-events:
  - hero CTA click
  - recommendation generation
  - try-on generation
  - add-to-cart
  - checkout preview
  - newsletter submit

---

## 9. API Surface (Current)

- `GET /api/catalog`
- `POST /api/ai/avatar-insight`
- `POST /api/ai/recommend`
- `POST /api/ai/tryon-plan`
- `POST /api/ai/tryon-generate`
- `GET /api/reviews`
- `POST /api/checkout/preview`
- `POST /api/newsletter/subscribe`

API responses must remain backward compatible with current frontend contracts unless accompanied by frontend updates in the same release.

