- [ ] **Phase 1 - Project Setup**
  - [ ] Validate environment bootstrap via `.cursor/environment.json` and `.cursor/install.sh`
  - [ ] Confirm required runtime dependencies from `requirements.txt` are installed
  - [ ] Lock global layout structure in `wig_ai_studio/templates/index.html`
  - [ ] Add base QA checklist for API and frontend smoke flows

- [ ] **Phase 2 - Core Components**
  - [ ] Finalize navbar/top-banner/footer component behaviors (`wig_ai_studio/templates/index.html`)
  - [ ] Standardize card, metric, badge, and button component styles (`wig_ai_studio/static/css/style.css`)
  - [ ] Harden async action patterns (loading state + toast + error fallback) in `wig_ai_studio/static/js/app.js`
  - [ ] Ensure shared API response contracts remain stable in `wig_ai_studio/app.py`

- [ ] **Phase 3 - Section Building (Spec-by-Spec)**
  - [ ] Build/refine Hero section per `website-sections/hero-section.md`
  - [ ] Build/refine Store section per `website-sections/store-section.md`
  - [ ] Build/refine AI Stylist section per `website-sections/ai-stylist-section.md`
  - [ ] Build/refine Try-On Lab section per `website-sections/tryon-lab-section.md`
  - [ ] Build/refine Reviews + Newsletter section per `website-sections/reviews-newsletter-section.md`

- [ ] **Phase 4 - Polish**
  - [ ] Tune landing-page copy hierarchy and CTA rhythm against `style-guide.md`
  - [ ] Improve responsive spacing and card density for tablet/mobile breakpoints
  - [ ] Add a11y sweep (label clarity, contrast, focus states, keyboard path)
  - [ ] Verify consistent visual tone across Bootstrap theme + custom CSS overrides

- [ ] **Phase 5 - Launch**
  - [ ] Run full test suite (`python3 -m pytest -q`)
  - [ ] Perform pre-release API smoke checks (`/api/catalog`, `/api/ai/*`, `/api/checkout/preview`, `/api/newsletter/subscribe`)
  - [ ] Validate try-on image generation in both mock and real-AI configurations
  - [ ] Update release notes and deployment checklist from `prd.md`
