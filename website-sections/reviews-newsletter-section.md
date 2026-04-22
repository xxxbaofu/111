# Reviews + Newsletter Section Spec

## Purpose
Increase trust and retain traffic through social proof and subscription capture.

## Content
- Reviews heading and short subheading
- Dynamic review cards populated from `/api/reviews`
- Newsletter form with email + preference + submit button
- Inline success/error message area

## Component Requirements
- Bootstrap cards and grid for review list
- Badge indicating review scene context
- Bootstrap form controls for newsletter

## Interaction
- Load reviews on initial page boot
- Submit newsletter asynchronously
- Show in-page feedback and toast message

## Accessibility
- Inputs and selects require labels
- Color contrast must satisfy dark theme readability
