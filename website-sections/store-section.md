# Store Section Spec

## Section ID
`#shop`

## Objective
- Let users discover wigs quickly with strong filter affordance.
- Keep product cards conversion-focused (view details + add to cart).

## Required Content
- Section title and short helper text.
- Filter toolbar:
  - Search input
  - Category filter
  - Scene filter
  - Sort select
  - Reset button
- Result metadata text.
- Product card grid.

## Data Source
- `GET /api/catalog`
- `POST /api/ai/recommend` (when recommendation mode is active)

## Component Requirements
- Card container with subtle contrast from page background.
- Desktop: 3-column product grid.
- Tablet: 2-column product grid.
- Mobile: 1-column product grid.
- Product card must include:
  - Name
  - Price or AI score
  - Tags (style/color/cap range)
  - Reason list
  - Primary and secondary actions

## Interaction Requirements
- Filters update list without full-page refresh.
- Reset should restore default filter state.
- Add to cart should provide instant feedback (toast).

## Accessibility
- Inputs need labels/placeholder clarity.
- Action buttons must be keyboard reachable.
