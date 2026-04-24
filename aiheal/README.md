# AIHeal — AI 健康管家 (Marketing Site)

Bilingual (中 / EN) marketing site for **AIHeal**, the AI Health Copilot.

> "Understand your body through data, not guesswork."

## Pages

Mapped 1:1 from the product JSON structure:

- `/` Home — hero, core features, demo report, use cases, data sources, CTA, infrastructure, developer entry
- `/product` — overview, health snapshot, trend tracking, AI report, comparison
- `/demo` — full report, analysis logic, risk detection, action plan
- `/scenarios` — office_workers, family_health, fitness_users, chronic_conditions
- `/technology` — data_ownership, privacy, ai_model, decentralization
- `/download` — iOS, Android, QR code
- `/developers` — API, Agent, SDK

## Stack

- Next.js 16 (App Router, static export)
- React 19
- TypeScript
- Tailwind CSS 3
- Client-side i18n (`lib/i18n.ts`) — stores choice in `localStorage`, auto-detects browser language

No external UI library, no external icons — every icon is inline SVG so the site stays light, fast, and fully controlled.

## Design

- Dark-first, glassy cards on an aurora background
- Mint `#2ee39b` accent as the health brand color
- Phone mockup component (`components/PhoneReport.tsx`) reused in hero, home demo section and `/demo`
- Strict conversion funnel: Home → Demo → Download, every section ends in a clear CTA

## Dev

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # static export + type check
npm start           # serve the built app
```

## Project layout

```
app/
  layout.tsx              Global shell (Nav + Footer + Providers)
  providers.tsx           I18nProvider (client)
  page.tsx                Home
  product/page.tsx
  demo/page.tsx
  scenarios/page.tsx
  technology/page.tsx
  download/page.tsx
  developers/page.tsx
components/
  Nav.tsx, Footer.tsx, Logo.tsx, LocaleToggle.tsx
  PageHero.tsx, SectionHeader.tsx, PhoneReport.tsx
  home/Hero.tsx
  home/CoreFeatures.tsx
  home/DemoReport.tsx
  home/UseCases.tsx
  home/DataSources.tsx
  home/CTA.tsx
  home/Infrastructure.tsx
  home/DeveloperEntry.tsx
lib/
  i18n.ts                 中 / EN dictionaries + React context
```

## i18n

All user-facing copy is stored in `lib/i18n.ts`. The locale toggle is in the top navigation; default locale is inferred from `navigator.language` (zh-\* → 中文, otherwise English) and persisted to `localStorage`.

To add or edit text, update the `zh` and `en` dictionaries in `lib/i18n.ts`.
