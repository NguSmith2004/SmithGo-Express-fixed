const content = {
  privacy: {
    eyebrow: 'PRIVACY', title: 'Privacy Notice', intro: 'This notice describes how SmithGo Express currently handles information in the software. Replace bracketed business details after legal review.',
    sections: [
      ['Operator', '[LEGAL BUSINESS NAME] operates or provides the SmithGo Express platform. Contact: [OFFICIAL CONTACT EMAIL] · [BUSINESS ADDRESS]. The platform appears technically structured as an intermediary listing independent transport agencies; the owner must confirm the legal business model.'],
      ['Information collected', 'The application collects account name, email, phone, password hash, passenger name, passenger phone, passenger email, optional ID/passport number, trip details, booking history, payment sender details, transaction reference, amount sent, payment status, notifications, and technical request data visible to hosting/database providers. Never send or store a Mobile Money PIN.'],
      ['Why it is used', 'Account access, schedule availability, booking and ticket issuance, payment verification, cancellation handling, customer support, fraud prevention, security, and operational records. The exact legal basis and retention periods require confirmation by the operator and Cameroonian counsel.'],
      ['Who receives it', 'Authorized SmithGo administrators, the selected transport agency where needed to operate the trip, MongoDB/hosting providers, and any future payment, email, or SMS provider that is actually configured. No such future provider should receive data until its contract, security, and disclosure have been reviewed.'],
      ['Storage and security', 'Passwords are bcrypt hashes. JWT authentication protects API routes. Booking access is scoped to the account. Payment status is controlled by authorized administrators. Production deployment must use HTTPS, restricted database access, managed secrets, rate limiting, security headers, backups, and incident procedures.'],
      ['Retention and rights', 'The software currently has no automated retention or deletion schedule. Suggested categories and decisions are documented in the compliance report. To request access, correction, deletion where legally applicable, or ask a privacy question, contact [OFFICIAL CONTACT EMAIL] with your booking/reference number. Requests may be subject to legal, fraud, accounting, or transport-record exceptions confirmed by counsel.'],
      ['Updates and complaints', 'Policy versions and an official complaint channel must be finalized by the operator before launch. Do not treat this draft as legal advice or as proof of regulatory approval.']
    ]
  },
  terms: {
    eyebrow: 'CUSTOMER TERMS', title: 'Terms & Conditions', intro: 'These are configurable platform terms, not a substitute for a reviewed contract with the operating business and transport agencies.',
    sections: [
      ['Accounts', 'Provide accurate information, protect your credentials, and do not share an account or use the service for fraud. SmithGo may suspend inactive, abusive, or suspicious accounts subject to applicable law and review.'],
      ['Bookings and agencies', 'A booking request reserves capacity only when the API accepts it. The named agency operates the published departure unless the platform expressly states otherwise. Customers must check agency, route, date, time, passenger details, and amount before submitting.'],
      ['Mobile Money', 'The current method is Mobile Money with manual verification. Send the exact amount only to the displayed merchant number +237 678949296. SmithGo never asks for a PIN. A submitted transaction is not a paid or confirmed booking until an authorized administrator verifies it.'],
      ['Tickets and confirmation', 'A ticket is available only after verified payment or an explicitly recorded administrator/agency-sponsored booking. A PDF reference and QR payload identify the record; QR scanning and public ticket verification are not currently implemented.'],
      ['Cancellation, refunds and changes', 'The current API can cancel eligible bookings and release seats. Automatic external refunds are not implemented. Refund eligibility, operator delays, schedule changes, no-shows, and rebooking rules are configurable business terms that must be supplied and legally reviewed before launch.'],
      ['Responsibilities and complaints', 'Transport safety, vehicle operation, licensing, insurance, and trip delivery belong to the operating agency or carrier as applicable. Contact [OFFICIAL CONTACT EMAIL] and include booking and payment references for support.'],
      ['Updates and disputes', 'The operator should publish the legal business name, governing-law wording, dispute channel, effective date, and version history after professional review.']
    ]
  },
  payment: {
    eyebrow: 'PAYMENT POLICY', title: 'Mobile Money Payment Policy', intro: 'SmithGo Express currently uses manual Mobile Money verification, not an automated operator API.',
    sections: [
      ['Payment recipient', 'Send the exact displayed booking amount to +237 678949296. Confirm the recipient in your Mobile Money app or USSD menu before approving.'],
      ['How to pay', 'On a compatible phone, choose Orange Money or MTN MoMo and tap Open USSD. The current operator codes are configurable; ART publishes Orange #150# and MTN Mobile Money *126*1# in its operator-code table. Complete the operator prompts and PIN yourself.'],
      ['Verification states', 'Awaiting Payment means no evidence has been submitted. Payment Submitted/Under Verification means the customer entered transaction evidence. Paid means an authorized administrator verified it. Payment Rejected means the evidence was not accepted. Refunded and Cancelled are recorded states; external refunds are not automated.'],
      ['Evidence and fraud', 'Submit sender name, sender phone, transaction reference, and exact amount. Do not submit a PIN. Duplicate references, incorrect amounts, or suspicious evidence may be rejected and may require operator confirmation.'],
      ['Credentials and providers', 'No MTN or Orange merchant API credentials are configured. The system does not pretend that a manual submission is an automatic payment. An official provider integration requires a merchant agreement, credentials, webhook/signature design, reconciliation, and legal/business review.']
    ]
  },
  cancellation: {
    eyebrow: 'TRIP CHANGES', title: 'Cancellation & Refund Policy', intro: 'This draft reflects the current software behavior only. The owner must set and publish the commercial policy after agency and legal review.',
    sections: [
      ['Current software behavior', 'Customers can cancel eligible bookings from My Trips. The server releases reserved seats and records cancellation. Paid records are marked refunded in the system, but no external payment refund is sent automatically.'],
      ['Business rules to configure', 'The operator must define cutoff time, agency-specific rules, no-show treatment, delayed/departure changes, processing fees if any, refund timing, and whether submitted-but-unverified payments are returned or investigated.'],
      ['Support', 'For a cancellation or payment dispute, contact [OFFICIAL CONTACT EMAIL] with the booking reference, payment reference, passenger name, and requested outcome.']
    ]
  },
  faq: {
    eyebrow: 'HELP', title: 'Frequently Asked Questions', intro: 'Answers below match the current implementation and identify where the business still needs to define a policy.',
    sections: [
      ['How do I book?', 'Register, log in, choose an agency, select a published departure, enter passenger details, and submit the booking. The server controls price and seat availability.'],
      ['When is a booking confirmed?', 'After Mobile Money evidence is submitted, the booking remains payment pending. An authorized admin must verify the payment before the booking becomes confirmed and the ticket is unlocked.'],
      ['How do I pay?', 'Send the exact amount to +237 678949296 using Mobile Money. The mobile flow can open the operator dialer, but you complete the prompts and PIN yourself.'],
      ['Does SmithGo store my PIN?', 'No. The system must never request or store a Mobile Money PIN.'],
      ['Can I cancel?', 'Eligible confirmed bookings can be cancelled through My Trips. Exact cutoff and refund rules are not yet configured; ask support.'],
      ['How do I get a ticket?', 'After payment verification, download the server-generated PDF from the confirmation or My Trips view. Unpaid tickets are blocked.'],
      ['What is the QR code?', 'It contains the booking reference and ticket ID. A public scan-verification/check-in service is not yet implemented.'],
      ['How do I request privacy help?', 'Use [OFFICIAL CONTACT EMAIL] and include enough information to identify your account without sending passwords, PINs, or JWTs.']
    ]
  },
  compliance: {
    eyebrow: 'TRANSPARENCY', title: 'Legal & Compliance', intro: 'SmithGo Express has implemented technical safeguards identified during an engineering review. This page is not a certificate, legal opinion, government approval, or claim of legal compliance.',
    sections: [
      ['Technical safeguards', 'The application uses bcrypt password hashing, JWT authentication, role checks, account scoping, server-side prices and seat reservations, payment-gated tickets, manual payment verification, environment-based secrets, MongoDB schema validation, and protected administrative endpoints.'],
      ['Current limits', 'The business operator, carrier/intermediary model, transport authorizations, tax/invoicing position, data-protection filings or approvals if applicable, cross-border processing, retention schedule, contracts, complaints channel, and payment-provider arrangements require external confirmation.'],
      ['Sources reviewed', 'Cameroon Law No. 2010/021 on electronic commerce is published through ART: https://www.art.cm/sites/default/files/documents/Loi-commerce-electronique-N-2010-021-du-21-12-2010.pdf. ART also publishes operator USSD information at https://www.art.cm/fr/code-ussd-operateurs. MINPOSTEL maintains a legal-texts portal at https://www.minpostel.gov.cm/index.php/en/legal-texts. Current-law status and application of personal-data and transport requirements require qualified review.'],
      ['Contact', 'Compliance questions and data requests should go to [OFFICIAL CONTACT EMAIL]. Replace this placeholder before launch.']
    ]
  }
};

export default function LegalPage({ type }) {
  const page = content[type] || content.faq;
  return <main className="page legalpage"><div className="pagehead"><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.intro}</p></div><div className="legalcontent">{page.sections.map(([heading, body]) => <section className="panel" key={heading}><h2>{heading}</h2><p>{body}</p></section>)}</div></main>;
}
