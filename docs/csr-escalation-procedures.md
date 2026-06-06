# CSR Training: Escalation & Refund Matrix (v3.0.0)

For Lumière Customer Support Representatives handling the Freshdesk integration.

## 1. Standard Refund Policy
If a customer requests a refund within 14 days of delivery for a non-lit candle, process a **full refund via original payment method**:
- In Razorpay: Select "Full Refund", Reason: "Customer Request".
- In Stripe: Select "Refund", Reason: "Requested by customer".

## 2. Damaged Goods Escalation 
If an order arrives broken (glass vessel damage):
- Request photographic evidence.
- Immediately trigger a **Replacement Order** internally.
- Notify warehouse via the `#ops-replacements` Slack channel.

## 3. Shipping & Logistics Exceptions
If Shiprocket / Delhivery flags a package as "RTO" (Return to Origin):
- Do not proactively refund.
- Send template email: `Order Delivery Exception (RTO)`.
- Re-initiate shipment upon confirming the correct address with the customer.

## 4. B2B / Bulk Order Queries
Any queries regarding custom bulk orders (weddings, corporate gifting) should be escalated directly to the **Sales Team**:
- Freshdesk Tag: `B2B_LEAD` 
- SLA for Sales to respond: 24 business hours.
