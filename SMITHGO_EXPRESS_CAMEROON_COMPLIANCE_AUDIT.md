# SmithGo Express Cameroon Compliance Audit

**Audit date:** 20 September 2026  
**Scope:** Source code and configuration in the current workspace, plus official online sources accessible on the audit date.  
**Status:** Technical risk-reduction review, not legal advice, certification, government approval, or a finding that the business is legally compliant.

> The technical controls described here can reduce software risk. They cannot establish business registration, transport licensing, tax status, payment-provider authorization, data-protection approvals, contracts, insurance, or legal compliance. Those matters require the owner and qualified Cameroonian professionals or authorities.

## Executive Summary

The platform is a React/Vite client with an Express/Mongoose API and MongoDB database. It processes account, passenger, booking, payment-evidence, notification, and administrative data. The current payment implementation is manual Mobile Money verification to `+237 678949296`; no official MTN or Orange merchant API is configured.

The following technical safeguards were implemented during this audit:

- Privacy, terms, payment, cancellation, FAQ, and legal-transparency pages.
- Registration acknowledgement for Terms and Privacy Notice versions.
- Security headers with Helmet.
- API and authentication rate limits.
- Root `.gitignore` excluding `.env`, `node_modules`, build output, and logs.
- Protected audit-log collection and API for payment verification and user administration.
- Existing backend payment gate, server-side prices, booking ownership checks, role checks, and manual verification reviewed.

High-priority unresolved items include official legal/business review, an identified operator/intermediary model, real support contacts, retention decisions, production HTTPS/secret management, official payment integration if automation is desired, and a complete automated security test suite.

## Business Model Requires Owner Confirmation

The code appears to support **Scenario B/C**: SmithGo Express is an online technology/intermediary service listing independent agencies and their schedules. The code does not prove that SmithGo Express owns buses or is itself a licensed carrier. The owner must confirm whether it is:

- a carrier operating transportation itself;
- a marketplace/intermediary for independent agencies; or
- a technology/booking service contracted by carriers.

This distinction affects contracts, agency responsibility, transport-sector obligations, consumer wording, tax/invoicing, insurance, payment collection, refunds, and licensing analysis.

## Sources Reviewed

1. **Cameroon ART, Law No. 2010/021 of 21 December 2010 on electronic commerce:** official PDF linked by ART: <https://www.art.cm/sites/default/files/documents/Loi-commerce-electronique-N-2010-021-du-21-12-2010.pdf>
2. **Cameroon ART, operator USSD codes:** <https://www.art.cm/fr/code-ussd-operateurs>. The page currently lists Orange Mobile Money `#150#` and MTN Mobile Money `*126*1#` in its table. Codes should still be reconfirmed with the operator before launch.
3. **MINPOSTEL legal texts portal:** <https://www.minpostel.gov.cm/index.php/en/legal-texts>
4. **ART regulatory library:** <https://www.art.cm/fr/reglementation/lois>
5. **Orange Money Cameroon official site:** <https://orangemoney.orange.cm/>. It describes transfer steps and publishes `#150#` information.
6. **MongoDB transaction/security documentation:** <https://www.mongodb.com/docs/manual/core/transactions/>
7. **Payment provider research:** no official merchant credentials or configured Cameroon operator API was found in the repository. No payment SDK is installed.

The accessible official sources did not provide a sufficiently verified copy of every requested current personal-data provision during this audit. The claimed Law No. 2024/017 and its scope, commencement, implementing instruments, regulator procedures, and cross-border rules require confirmation from the official legislative source and qualified Cameroonian counsel before relying on a legal conclusion.

## Legal Requirements Matrix

| Area | Source / status | Applies? | Current technical status | External action |
|---|---|---|---|---|
| Electronic commerce | Law 2010/021; official ART PDF | Likely relevant to online booking/contract information | Terms, payment information, references, and records are now surfaced; legal contract wording is draft | Counsel should map required notices, records, invoices, and consumer information to actual business |
| Electronic contracts | Law 2010/021; article-level legal review required | Likely | Registration acknowledgement and booking records exist | Confirm acceptance, evidence, language, withdrawal/cancellation, and record requirements |
| Consumer information | Law 2010/021 plus sector/consumer rules to confirm | Likely | Route, agency, date, time, amount, status, and payment instructions are shown | Confirm mandatory disclosures, pricing/tax treatment, and operator responsibilities |
| Personal data | Law 2024/017 was requested but article/current official status not verified here | Clearly relevant | Data inventory, privacy draft, account scoping, password hashing | Counsel/data specialist must confirm controller/processor roles, notices, rights, registration/authorization, transfers, and retention |
| Data security | Cybersecurity law and general security duties require article-level review | Clearly relevant | JWT, bcrypt, Helmet, rate limits, role checks, server-side payment status, audit logs | Add production HTTPS, monitoring, incident response, backups, penetration testing |
| Mobile Money | Operator/provider contracts and financial/payment regulation | Clearly relevant | Manual evidence workflow only; no fake API; payment gate | Obtain merchant agreement/API or formally approve manual process and reconciliation |
| Tickets/receipts | Electronic-commerce and tax/accounting treatment requires confirmation | Likely | PDF ticket has reference, amount, status, QR payload | Confirm whether ticket is receipt/invoice, required fiscal data, and retention |
| Refunds | Business policy and provider/agency contracts | Likely | Cancellation records refunded state internally; no external refund automation | Define and publish cutoff, eligibility, timing, fees, and actual refund process |
| Complaints | Consumer/business obligation to confirm | Likely | Placeholder support contact and FAQ | Provide real support identity, address/email/phone, escalation and response process |
| Terms/privacy | Transparency and contract evidence | Clearly relevant | Draft pages and registration acknowledgement | Replace placeholders; legal review; version and acceptance migration policy |
| Cookies/tracking | Depends on tracking actually used | Limited | No analytics/tracking service found; localStorage JWT is used | Document localStorage/security decision; add notice/controls if tracking is added |
| Retention/deletion | Law/business/accounting/transport requirements to confirm | Clearly relevant | No automatic retention/deletion job | Set category-specific retention with counsel; implement deletion/access workflow |
| Third-party processing | MongoDB Atlas currently configured; Google Fonts are imported by CSS | Clearly relevant | Disclosed in manual/policy draft | Review contracts, locations, subprocessors, transfers, security and disclosures |
| Transport licensing | Depends on carrier/intermediary model | Requires confirmation | Software lists agencies and schedules; it does not prove licenses | Verify each operator, contracts, insurance, passenger-safety and transport authority position |
| Tax/invoicing | Depends on entity, collection model, tax advice | Requires confirmation | Amount stored and shown; no tax invoice module | Obtain tax/accounting advice and implement required records |

## Personal Data Inventory

| Data | Collection/storage | Purpose | Access | Retention decision |
|---|---|---|---|---|
| Name | Registration/User; passenger snapshot in Booking | Account and passenger identification | User, authorized admins, relevant agency | Business/legal determination |
| Email | Registration/User; passenger snapshot | Login, contact, booking record | User, authorized admins, relevant agency | Business/legal determination |
| Phone | Registration/User; passenger/payment evidence | Contact, trip/payment identification | User, authorized admins, relevant agency | Business/legal determination |
| Password | User as bcrypt hash only | Authentication | Server authentication code; never returned | Until account deletion subject to lawful record needs |
| Passenger ID/passport field | Booking optional form | Operational passenger identification; necessity not established | User/admin/agency if accessed | Remove unless documented need is confirmed |
| Route/date/time/seat | Schedule and Booking | Reserve and operate trip | User/admin/agency | Transport/accounting determination |
| Booking reference/ticket ID | Booking/PDF | Electronic record and ticket lookup | User/admin/agency | Business/legal determination |
| Payment sender name/phone | Payment | Manual verification | Admin/payment reviewers | Provider/accounting/fraud determination |
| Transaction reference | Payment | Verify customer claim with operator records | Admin/payment reviewers | Provider/accounting/fraud determination |
| Amount/payment status | Booking/Payment | Reconciliation and ticket gate | User/admin/agency | Accounting/legal determination |
| Notifications | Notification | Operational communication | Recipient/admin workflow | Suggested short operational period; confirm legally |
| IP address | Audit log request metadata | Security/admin traceability | Admin/security only | Define security-log period with counsel |
| JWT/localStorage token | Browser localStorage | Session continuity | Browser scripts | Clear on logout; XSS remains a risk; evaluate HttpOnly cookie migration |

Never store Mobile Money PINs, bank credentials, JWTs in logs, or plaintext passwords.

## Technical Findings and Risk Classification

| Severity | Finding | Evidence | Action |
|---|---|---|---|
| CRITICAL | Real `server/.env` exists in the workspace and contains secrets | `server/.env` | Rotate any exposed credentials, ensure it is ignored, and never commit/share it |
| HIGH | Manual Mobile Money is not automatic verification | No provider SDK/webhook/credentials | Keep explicit `submitted` state; obtain official provider credentials before automation |
| HIGH | Legal owner, support identity, retention, and carrier/intermediary model are placeholders | Policy pages and source code | Owner and counsel must fill and approve before launch |
| HIGH | JWT is stored in localStorage | `AuthContext.jsx` | Evaluate HttpOnly secure cookie migration and XSS protections |
| HIGH | No automated tests, backups, incident monitoring, or production deployment controls | package scripts/repository | Add before production |
| MEDIUM | Passenger ID/passport field may be unnecessary | `Book.jsx` and Booking model | Remove or document necessity and access/retention |
| MEDIUM | Agency-manager authorization is broad and not agency-scoped | `adminOrManager` routes | Associate manager with agencies and enforce ownership |
| MEDIUM | Audit coverage is partial | `AuditLog`, payment/user hooks | Add booking, agency, schedule, ticket, login, and policy events |
| LOW | QR payload has no public verification/check-in endpoint | Ticket controller | Add signed verification endpoint/scanner if operationally needed |
| INFORMATIONAL | Official law status and exact article mapping require specialist confirmation | Source review | Do not treat this report as legal advice |

## Evidence / Traceability

| System feature | Principle addressed | Evidence |
|---|---|---|
| Password protection | Credential confidentiality | `server/src/controllers/auth.js`, bcrypt hash |
| Authorization | Access control | `server/src/middleware/auth.js`, protected routes |
| Payment integrity | Do not trust client-paid flag | `server/src/controllers/payments.js`, `Booking.paymentStatus` |
| Ticket gate | Do not represent unpaid booking as valid paid ticket | `server/src/controllers/bookings.js` |
| Capacity integrity | Avoid basic overbooking | `Schedule.findOneAndUpdate` atomic seat decrement |
| Transparency | Inform customers before/at booking | `LegalPage.jsx`, booking/confirmation screens |
| Acceptance record | Terms/privacy acknowledgement | `User.termsAcceptedAt`, `termsVersion`, `privacyNoticeVersion` |
| Admin traceability | Sensitive action record | `AuditLog`, `/api/audit` |
| Security baseline | Headers and throttling | `server/src/server.js` Helmet/rate limits |
| Secret exclusion | Reduce accidental commits | root `.gitignore` |

## Data Retention Structure

The code does not invent mandatory periods. The owner should approve a schedule with counsel:

- Account data: retain while active and for a defined post-account period if justified.
- Booking and ticket records: retain for operational, dispute, accounting, and transport reasons as confirmed.
- Payment evidence: retain only as long as reconciliation, fraud, provider, tax, and dispute needs justify.
- Notifications: short operational retention unless needed for dispute evidence.
- Audit logs: retain for security/accountability period approved by the operator.
- Support messages: retain for complaint resolution and legal/accounting needs as approved.

After the approved period, delete, anonymize, or aggregate data and document exceptions.

## What Was Changed

- `client/src/pages/LegalPage.jsx`: created customer-facing privacy, terms, payment, cancellation, FAQ, and compliance content with placeholders and transparent limitations.
- `client/src/components/Footer.jsx`: added discoverable policy/support links.
- `client/src/App.jsx`: mounted policy routes and footer.
- `client/src/pages/Auth.jsx`: added required Terms/Privacy acknowledgement.
- `server/src/models/User.js`: stored acknowledgement timestamp and versions.
- `server/src/controllers/auth.js`: rejects registration without acknowledgement.
- `server/src/server.js`: added Helmet, API throttling, stricter auth throttling, and audit route.
- `.gitignore`: excludes secrets, dependencies, builds, and logs.
- `server/src/models/AuditLog.js`, `server/src/utils/audit.js`, `server/src/controllers/audit.js`, `server/src/routes/audit.js`: added protected audit records.
- `server/src/controllers/payments.js` and `users.js`: record admin payment/user actions.
- `client/.env.example`: documents configurable Cameroon operator codes.

## Testing Report

Passed during this audit:

- Client production build with `npm run build`.
- Editor diagnostics for policy/auth/app files: no errors.
- Node syntax checks for changed backend files.
- MongoDB startup and `/api/health` smoke test in earlier validation.
- Manual seed command after repairing the agency slug index.

Not yet automated:

- Full registration/login API test suite.
- Authorization penetration tests.
- Duplicate transaction-reference test.
- Audit-log integration test.
- Browser/mobile USSD test on a real Cameroon SIM.
- PDF/QR snapshot or scan test.

## External Actions Required

- Have a Cameroonian lawyer review this report and policy text.
- Confirm the legal business/operator/intermediary model.
- Confirm current personal-data law, regulator process, rights, transfers, retention, and processor contracts.
- Verify carrier/agency authorizations, insurance, contracts, transport obligations, tax/invoicing, and consumer policy.
- Replace all policy placeholders with the real legal business name, address, support channel, effective dates, and complaint process.
- Rotate any secret present in the current local `.env` if it was shared or committed.
- Obtain official MTN/Orange merchant credentials if automatic payment verification is required.
- Configure production HTTPS, secrets, backups, monitoring, and incident response.

## Final Status

The software has technical safeguards designed in response to identified risk areas. It is **not declared legally compliant**. The unresolved legal/business items above require qualified professional or regulator confirmation.

# GO-LIVE COMPLIANCE CHECKLIST

| Item | Status | Action Required |
|---|---|---|
| Policy pages linked | Implemented | Replace placeholders and obtain legal review |
| Terms/privacy acknowledgement | Implemented | Define migration for existing accounts |
| Payment transparency | Implemented | Confirm merchant ownership and operator arrangements |
| Manual payment verification | Implemented | Approve business process and reconciliation |
| Automated payment API | Not implemented | Obtain official credentials/agreement |
| Password hashing/JWT/roles | Implemented | Add deeper security testing and production secret management |
| Security headers/rate limits | Implemented | Tune limits and monitor false positives |
| Audit logs | Partially implemented | Extend to all sensitive actions and define retention |
| Data deletion/access/correction | Partially implemented | Define legal workflow and build authenticated request tools |
| Retention schedule | Not implemented | Business/legal determination required |
| Support/complaints contact | Placeholder | Supply real contact and escalation process |
| Transport/operator authorization | External verification | Confirm with owner, agencies, counsel, and relevant authority |
| Tax/invoicing | External verification | Obtain accounting/tax advice |
| Production hosting/HTTPS/backups | Not configured | Configure and test before launch |
| Automated compliance/security tests | Not implemented | Add API and end-to-end test suite |
