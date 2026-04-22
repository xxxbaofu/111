- [ ] **Phase 1 - Setup**
  - [ ] Initialize React app shell and move page entry from `wig_ai_studio/templates/index.html` into `src/pages/LandingPage.tsx`.
  - [ ] Install and configure Tailwind CSS with token mapping from `style-guide.md` (Aurora Violet, Luxe Indigo, Electric Rose, dark surfaces).
  - [ ] Create `tailwind.config.ts` theme extension for color tokens, spacing scale (8px grid), typography scale (H1–H5), and shadow presets.
  - [ ] Build layout container utility (`max-w-[1200px]`, section spacing helpers) and apply globally in `src/layouts/MainLayout.tsx`.
  - [ ] Set up baseline route and section anchor navigation behavior (`#shop`, `#ai-stylist`, `#tryon-lab`, `#reviews`).

- [ ] **Phase 2 - Core UI System**
  - [ ] Build `Button` component with exact variants: `primary`, `secondary`; include loading state and disabled behavior.
  - [ ] Build `Card` component with only 3 variants: `primarySurface`, `neutralContent`, `utilityPanel` (no extra variants).
  - [ ] Build `Input` and `Select` field components using dark glass style, focus halo, and accessible labels.
  - [ ] Build `Tag/Chip` component with neutral and accent status modes; enforce short labels.
  - [ ] Build global `Toast` feedback component for success/warning/error micro-interactions.

- [ ] **Phase 3 - Sections**
  - [ ] **Hero section** (`website-sections/hero-section.md`): build left-copy/right-visual layout, enforce premium copy hierarchy, wire primary/secondary CTA.
  - [ ] **Store section** (`website-sections/store-section.md`): implement filter bar, product card grid, add-to-cart and quick-view actions.
  - [ ] **AI Stylist section** (`website-sections/ai-stylist-section.md`): build profile form + insight/cart split layout and recommendation flow actions.
  - [ ] **Try-On Lab section** (`website-sections/tryon-lab-section.md`): build generation controls, mode toggle, and output gallery with provider metadata.
  - [ ] **Reviews + Newsletter section** (`website-sections/reviews-newsletter-section.md`): build trust block and compact subscription conversion form.

- [ ] **Phase 4 - UX Polish**
  - [ ] Refine section spacing using 8px rhythm rules from `style-guide.md`; remove inconsistent paddings and random gaps.
  - [ ] Tune hover and motion timing to style-guide constraints (120/180/240ms only, no aggressive transforms).
  - [ ] Tighten on-page copy to short premium tone; remove generic/verbose statements.
  - [ ] Reduce clutter by limiting each section to 2–3 primary visual focal elements.
  - [ ] Run visual hierarchy pass for CTA dominance, readability, and trust signal clarity.

- [ ] **Phase 5 - Launch**
  - [ ] Run responsive QA across mobile/tablet/desktop and fix layout breaks in hero, form, and gallery sections.
  - [ ] Perform performance pass: defer non-critical 3D work, lazy-load heavy showcase/generation modules.
  - [ ] Validate API integration contracts for recommendation, try-on, cart preview, and newsletter flows.
  - [ ] Run final regression (`python3 -m pytest -q`) and frontend smoke checks for all CTA paths.
  - [ ] Complete final launch checklist with design-system compliance and PRD acceptance criteria.
