# WigVerse AI — Product-Level PRD (Upgrade)

## 1) Product Positioning

WigVerse AI is not “another wig shop with filters.”  
It replaces three broken workflows users currently jump between:

1. **Marketplace browsing chaos** (endless static product grids),
2. **Manual social validation** (asking friends/communities if a wig fits),
3. **Offline imagination gap** (cannot preview look in real context before buying).

WigVerse AI positions itself as an **AI decision layer + commerce layer**:
- Understand me
- Show me what fits
- Let me preview
- Let me buy with confidence

This is a “guided selection product,” not a catalog-first store.

---

## 2) UX Strategy

### 2.1 Why AI Stylist is the Core Entry

Traditional e-commerce starts from products.  
This product starts from **user identity + constraints** (face shape, head size, scene, style intent).

Reason:
- Wig choice is high-uncertainty and appearance-sensitive.
- Users do not search by SKU; they search by confidence.
- AI Stylist converts vague intent into short-list decisions.

### 2.2 Why NOT a Traditional E-commerce Layout

A purely product-grid-first layout increases cognitive load:
- too many options too early
- weak fit confidence
- low trust in visual outcome

Therefore the page must prioritize:
1. Value proposition (hero)
2. Guided flow (AI entry)
3. Validation (try-on output + social proof)
4. Transaction (cart/checkout preview)

Commerce remains present, but not the first cognitive step.

---

## 3) Page Structure (Critical)

References:
- `website-sections/hero-section.md`
- `website-sections/store-section.md`
- `website-sections/ai-stylist-section.md`
- `website-sections/tryon-lab-section.md`
- `website-sections/reviews-newsletter-section.md`

### 3.1 Hero Section
- **Goal**: Conversion + positioning clarity
- **Layout**: Left (copy + CTA) / Right (3D preview)
- **Key Interaction**:
  - Primary CTA to AI Stylist
  - Secondary CTA to Try-On Lab
  - 3D color switch affordance

### 3.2 Store Section
- **Goal**: Engagement + shortlist expansion
- **Layout**: Top control row + product card grid
- **Key Interaction**:
  - search/filter/sort
  - quick view
  - add-to-cart

### 3.3 AI Stylist Section
- **Goal**: High-intent conversion
- **Layout**: Left (profile form) / Right (insights + cart panel)
- **Key Interaction**:
  - avatar analysis
  - recommendation generation
  - try-on plan generation
  - checkout preview utility in same decision context

### 3.4 Try-On Lab Section
- **Goal**: Trust + purchase confidence
- **Layout**: Control panel + generated gallery
- **Key Interaction**:
  - image generation parameters
  - mock vs real AI mode
  - generated visual confirmation

### 3.5 Reviews + Newsletter Section
- **Goal**: Trust + retention
- **Layout**: Social proof cards followed by compact subscribe form
- **Key Interaction**:
  - read proof
  - subscribe for lifecycle re-entry

---

## 4) Design System Enforcement

Source of truth: `style-guide.md`

### Must stay consistent
- Color token usage (especially glow limits)
- Typography hierarchy H1–H5
- 2–3 card variants only
- Primary/secondary CTA behavior
- 8px spacing rhythm
- Subtle motion limits

### Enforcement mechanism
- No section-level ad-hoc color definitions
- No new component variants without style-guide update
- Every new block must map to existing component primitives
- UI reviews reject template-like clutter and redundant decorations

---

## 5) Tech Stack (Realistic Target)

### Target Frontend
- **React + Tailwind CSS** (default target architecture)
- Componentized section composition
- Tailwind token mapping from style-guide

### Current Implementation (transitional baseline)
- Flask + Jinja + vanilla JS + Bootswatch

### Backend / AI
- Python + Flask API layer
- Rule-based recommendation engine
- Optional OpenAI image generation with mock fallback

### Animation approach (no overkill)
- CSS transitions + lightweight interaction states
- Optional Framer Motion only for minimal entrance/hover micro-effects
- No large scene animations in core conversion path

---

## 6) Performance Rules

### Core Rules
- Do not block first paint with heavy 3D setup
- 3D canvas initializes lightweight and progressively
- Try-on generation is always user-triggered (never eager)
- Limit generated images per request (max 4)

### Loading Strategy
- Lazy-load non-critical visual modules where possible
- Defer expensive interactions until user intent is clear
- Keep hero text + primary CTA instantly available

### Stability Rules
- All AI image flows must have fallback mode
- API failures should show graceful UI notices, never dead-end

---

## 7) Architecture & File References

### Current source files
- Template: `wig_ai_studio/templates/index.html`
- Styling: `wig_ai_studio/static/css/style.css`
- Interaction: `wig_ai_studio/static/js/app.js`
- API: `wig_ai_studio/app.py`

### Key API Surface
- `GET /api/catalog`
- `POST /api/ai/avatar-insight`
- `POST /api/ai/recommend`
- `POST /api/ai/tryon-plan`
- `POST /api/ai/tryon-generate`
- `GET /api/reviews`
- `POST /api/checkout/preview`
- `POST /api/newsletter/subscribe`

---

## 8) Product Quality Guardrails

- If UI feels like template noise, simplify before adding.
- If hierarchy is unclear, reduce competing accents.
- If section goal is ambiguous, rewrite copy before redesign.
- If interaction is not conversion/trust/clarity-critical, remove it.

