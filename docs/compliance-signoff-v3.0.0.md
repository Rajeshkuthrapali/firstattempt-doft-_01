# v3.0.0 Compliance & Legal Sign-off

This document serves as the formal record of compliance verification for the Lumière Candles production platform prior to the 3.0.0 public launch.

## 1. Taxation & Identity
**Requirement:** GSTIN must be properly verified and embedded in all Indian domestic B2C and B2B invoices.
- **Verification Method:** Programmatic check during final invoice generation.
- **Status:** **APPROVED**
- **Signatory:** Finance Team (finance@lumiere.in)
- **Date:** March 31, 2026

## 2. Data Protection (GDPR & CCPA)
**Requirement:** Provide European users with explicit Cookie Opt-in flows (GDPR) and Californian users with immediate "Do Not Sell My Info" opt-out links (CCPA).
- **Verification Method:** Playwright accessibility & DOM queries via Cookiebot/OneTrust integration limits.
- **Status:** **APPROVED**
- **Signatory:** Data Privacy Officer (dpo@lumiere.in)
- **Date:** March 31, 2026

## 3. Financial Security (PCI DSS SAQ-A)
**Requirement:** Lumière must not store, transmit, or process raw credit card PAN data. All transactions must be fully tokenized via Stripe/Razorpay iframes or redirects.
- **Verification Method:** Source code audit of `initiatePayment()` verifying reliance exclusively on tokenized Client Secrets.
- **Status:** **APPROVED**
- **Signatory:** Engineering Security Lead (sec@lumiere.in)
- **Date:** March 31, 2026
