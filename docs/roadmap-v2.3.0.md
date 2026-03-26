# Lumière v2.3.0 Roadmap (P4)

## Overview

Building upon the stable scale and ecosystem features delivered in v2.2.0, the upcoming v2.3.0 milestone will focus on **Advanced Personalization**, **Marketing Connectivity**, and **Deeper CMS Integrations**. This will evolve the platform from a catalog into an intelligent storefront.

## Key Initiatives

### 1. Advanced Personalization

- **AI-Powered "Scent Match" Quiz**: Implement an interactive, multistep quiz module helping users find their signature scent, storing the result in the user profile.
- **Dynamic Recommended Products**: Expand the basic `marketing.ts` logic into a real-time recommendation engine analyzing cart, purchase history, and quiz results.
- **Gifting Preferences**: Allow users to save recipient addresses and upcoming calendar events (birthdays, anniversaries) for automated gifting reminders.

### 2. Marketing Automation

- **Provider Integration**: Finalize webhook wiring with Resend or SendGrid for robust transactional delivery.
- **Abandoned Cart Flow**: Orchestrate timed follow-up cadences with dynamic cart rendering in email templates.
- **Loyalty Nurturing**: Automated email triggers when a user unlocks a new Tier or has points expiring.

### 3. Deeper CMS Integration

- **Dynamic Collections**: Migrate product collections mapping from static code to the Sanity backend, allowing editorial control over collection cover images and descriptive copy.
- **Landing Page Builder**: Scaffold generic blocks in Sanity (Hero, Highlight Grid, Newsletter Sign-up) allowing editors to spin up ad-hoc campaign landing pages without engineering intervention.

## Architectural Considerations

- **GraphQL API Gateway**: Depending on data complexity scaling with personalization, evaluate wrapping Prisma in an Apollo/GraphQL gateway for optimized frontend payloads.
- **A/B Testing Framework**: Implement lightweight edge-middleware logic (e.g. Vercel Edge Config) to route percentage of traffic based on feature flags for conversion optimization.
