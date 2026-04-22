# WigVerse AI Product Brief

## 1) Product Vision
WigVerse AI is a conversion-focused wig storefront that combines AI-guided selection and visual try-on generation to reduce decision friction for daily, fashion, and cosplay buyers.

## 2) Core User Problem
Users struggle to choose wigs from static catalog grids because they cannot quickly validate:
- Face-shape compatibility
- Head-size fit
- Scene suitability (daily vs. cosplay/stage)
- Final visual outcome before purchase

## 3) Target Audience
- Primary: women and cosplay users (18-35) shopping online for wigs
- Secondary: content creators, event performers, and stylists

## 4) Product Goals
- Reduce time-to-decision from browsing to shortlisting
- Increase add-to-cart rate through explainable recommendations
- Improve confidence with scenario-based try-on image generation
- Keep the storefront readable, premium, and mobile-friendly

## 5) Key Functional Scope
1. AI profile analysis (avatar + fit preferences)
2. Recommendation ranking with explainable reasons
3. Product catalog browse/filter/sort
4. Cart and checkout preview
5. Try-on plan generation and image generation (mock + real AI mode)
6. Social proof section (reviews)
7. Newsletter conversion section

## 6) Success Metrics
- CTR on primary hero CTA
- Recommendation generation completion rate
- Try-on generation completion rate
- Add-to-cart rate
- Checkout preview engagement rate
- Newsletter subscribe rate

## 7) Constraints
- Initial implementation uses Flask + Jinja templates + vanilla JS
- AI image generation can run in mock mode when provider keys are absent
- Must remain responsive and performant without heavy frontend frameworks
