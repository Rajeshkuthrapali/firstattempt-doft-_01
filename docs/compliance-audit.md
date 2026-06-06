# PCI / GDPR / Compliance Audit Checklist (P11 — v3.0.0)

## PCI DSS (SAQ-A)

Lumière uses a payment gateway redirect model — no card data touches our servers.
SAQ-A is the applicable self-assessment questionnaire.

| Control | Requirement | Status | Notes |
| --- | --- | --- | --- |
| 1.1 | Network security controls documented | ✅ | Vercel edge + Cloudflare WAF |
| 2.2 | Default passwords changed on all systems | ✅ | DB credentials rotated at deploy |
| 3.1 | No card data stored | ✅ | All card handling via Stripe/Razorpay hosted fields |
| 4.2 | Strong TLS (≥1.2) for cardholder data in transit | ✅ | TLS 1.3 enforced at CDN |
| 6.2 | Software development security standards | ✅ | Dependency scanning via `npm audit` in CI |
| 6.3 | WAF protecting public-facing applications | ✅ | Cloudflare WAF with OWASP ruleset |
| 8.2 | MFA on all administrative access | ✅ | GitHub SSO + Vercel MFA enforced |
| 9.1 | Physical security N/A | ✅ | Serverless — no physical servers |
| 11.3 | Vulnerability scans performed quarterly | ⬜ | Schedule first scan post-launch |
| 12.1 | Security policy documented | ✅ | `/docs/security-policy.md` |

**PCI SAQ-A Status: COMPLIANT** (pending quarterly scan scheduling)

---

## GDPR (EU General Data Protection Regulation)

| Article | Requirement | Status | Implementation |
| --- | --- | --- | --- |
| Art. 6 | Lawful basis for processing | ✅ | Contract (orders), consent (marketing) |
| Art. 7 | Consent management | ✅ | Cookie banner with granular controls |
| Art. 13 | Privacy notice at point of collection | ✅ | Privacy Policy linked at checkout |
| Art. 17 | Right to erasure | ✅ | `/api/account/delete` endpoint |
| Art. 20 | Data portability | ✅ | `/api/account/export` (JSON download) |
| Art. 25 | Privacy by design | ✅ | Minimal data collection, hashed PII |
| Art. 30 | Records of processing activities | ⬜ | ROPA document to be completed |
| Art. 32 | Security of processing | ✅ | Encryption at rest (AES-256), TLS in transit |
| Art. 33 | Breach notification (72h to DPA) | ✅ | Sentry alerting + incident runbook |
| Art. 37 | DPO appointment | ⬜ | Legal to confirm if DPO required |

**GDPR Status: SUBSTANTIALLY COMPLIANT** (ROPA and DPO items pending)

---

## CCPA (California Consumer Privacy Act)

| Requirement | Status | Notes |
| --- | --- | --- |
| Privacy notice | ✅ | Covers CCPA disclosures |
| Do Not Sell link | ✅ | Footer "Do Not Sell My Info" → preference center |
| Right to know / access | ✅ | Account data export |
| Right to delete | ✅ | Account deletion flow |
| Non-discrimination | ✅ | No service downgrade for opt-out |
| Opt-out signal (GPC) | ⬜ | Global Privacy Control header detection pending |

**CCPA Status: COMPLIANT** (GPC signal handling planned for v3.1.0)

---

## DPDPA (India Digital Personal Data Protection Act)

| Requirement | Status | Notes |
| --- | --- | --- |
| Consent before processing | ✅ | Explicit opt-in at registration |
| Purpose limitation | ✅ | Data used only for stated purposes |
| Data minimization | ✅ | Minimal fields collected at checkout |
| Data fiduciary obligations | ⬜ | Registration with DPB pending govt guidance |
| Cross-border data transfer | ⬜ | Whitelist analysis for US/EU infra |

**DPDPA Status: PARTIALLY COMPLIANT** (Awaiting regulatory guidance on fiduciary registration)

---

## Security Controls

### Authentication & Access
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens with 15-minute expiry + refresh rotation
- Admin routes protected with role-based guard (RBAC)
- Rate limiting: 10 req/min on `/api/auth/login`

### Data Protection
- PostgreSQL: encryption at rest (AES-256 via AWS RDS)
- S3 backups: SSE-S3 encryption
- PII fields: email hashed for analytics, full value only for transactional use
- Secrets: never in code, only via environment variables

### Vulnerability Management
```bash
# Run in CI on every PR:
npm audit --audit-level=high

# Run weekly:
npx better-npm-audit audit

# Quarterly external scan:
# Engage OWASP ZAP or Burp Suite Professional
```

### Incident Response
1. **Detection**: Sentry alert fires, PagerDuty pages on-call
2. **Triage**: Classify severity (P0–P3), initiate war room
3. **Containment**: Block suspicious IPs via Cloudflare, revoke compromised tokens
4. **Eradication**: Patch vulnerability, rotate all affected credentials
5. **Recovery**: Restore from PITR if data corruption
6. **Post-incident**: Within 72h — DPA notification (if GDPR), customer communication
