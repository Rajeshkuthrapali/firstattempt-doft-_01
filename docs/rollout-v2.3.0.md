# v2.3.0 Rollout & QA Matrix

## Pre-Release QA Matrix

### 1. Advanced Personalization

- [ ] **Scent Match Quiz:** Verify keyboard navigation through all options. Validate that terminal selection correctly redirects to `/collections?scent=[profile]` and that the catalog correctly filters down.
- [ ] **Quiz Webhook:** Verify that submitting the quiz successfully triggers the mock `/api/webhooks/marketing/quiz-result` endpoint.

### 2. CMS Dynamic Pages (`/campaign`)

- [ ] **Hero Block:** Ensure fallback imaging triggers correctly if `backgroundImageUrl` is missing or slow.
- [ ] **Sign-up Block:** Ensure email regex sanitization prevents malformed payloads and triggers the confirmation UI branch.
- [ ] **Grid Block:** Verify images retain `aspect-[4/5]` across all breakpoints (mobile/tablet/desktop).

### 3. Marketing Automations

- [ ] **Loyalty Webhooks:** Test points adjustment in Admin panel. Verify that crossing a tier threshold triggers `triggerLoyaltyUnlockEmail`.
- [ ] **Abandoned recovery:** Verify cart contents map correctly into `items` schema payload.

## Stakeholder Checkpoint Schedule

- **Mid-Sprint Review**: Walkthrough of the functioning Scent Match quiz flow and admin log interface.
- **Pre-Release validation**: QA approval on simulated email automations (via Resend testing domains).
