# SmithGo Express Technical & Setup Manual

**Project:** SmithGo Express Online Booking System  
**Architecture:** React + Vite frontend, Express + Node.js REST API, MongoDB Atlas through Mongoose  
**Current development API port:** `5001`  
**Current development frontend port:** Vite's default port, normally `5173`  
**Document status:** Living documentation. Update this file whenever routes, models, environment variables, or operational workflows change.

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Environment Configuration](#6-environment-configuration)
7. [Install and Run](#7-install-and-run)
8. [MongoDB Atlas](#8-mongodb-atlas)
9. [Database Models](#9-database-models)
10. [Authentication](#10-authentication)
11. [API Reference](#11-api-reference)
12. [Agencies and Schedules](#12-agencies-and-schedules)
13. [Booking Workflow](#13-booking-workflow)
14. [Mobile Money Workflow](#14-mobile-money-workflow)
15. [Tickets](#15-tickets)
16. [Customer Experience](#16-customer-experience)
17. [Administration](#17-administration)
18. [UI and UX](#18-ui-and-ux)
19. [Security](#19-security)
20. [Testing](#20-testing)
21. [Troubleshooting](#21-troubleshooting)
22. [GitHub](#22-github)
23. [Deployment](#23-deployment)
24. [Remaining Work](#24-remaining-work)
25. [Start Here](#25-start-here)

## 1. System Overview
- **Agency managers:** the role exists and is permitted to manage agency and schedule endpoints, but the current UI is primarily an administrator dashboard and does not yet provide a separate agency-manager workspace.

The main journey is:
  -> Customer sends Mobile Money to +237 678949296
  -> Customer submits transaction evidence
  -> Admin verifies manually
  E --> M[Mongoose]
  M --> DB[(MongoDB Atlas or local MongoDB)]
  E --> PDF[PDFKit + QRCode]
```

The browser does not silently execute USSD, enter a PIN, or verify a transfer. That would require a regulated operator integration and merchant credentials. The current implementation uses an explicit mobile dialer handoff plus manual verification.

| Technology | Version in project | Purpose |
|---|---:|---|
| React | `^18.3.1` | Component-based interface |
| React DOM | `^18.3.1` | Browser rendering |
| Vite | `^6.4.3` | Development server and production bundling |
| React Router DOM | `^7.1.1` | Client-side routes and protected pages |
| Framer Motion | `^11.15.0` | Page/card animation |
| Lucide React | `^0.468.0` | Interface icons |
| Vite React plugin | `^5.0.4` | JSX transform and Vite integration |

The frontend uses the browser Fetch API through `client/src/lib/api.js`; it does not use Axios. PDF files are downloaded as `Blob` values returned by the API.

### Backend
| Ticket is marked provisional | Payment is not verified. Complete Mobile Money payment and wait for admin verification before boarding. |
| Technology | Version in project | Purpose |
|---|---:|---|
| Node.js | Not pinned by the repository | JavaScript runtime; use a current supported LTS release |
| Express | `^4.21.2` | HTTP server and REST routes |
| Mongoose | `^8.8.4` | MongoDB connection, schemas, validation, and queries |
| bcryptjs | `^2.4.3` | Password hashing and comparison |
| jsonwebtoken | `^9.0.2` | JWT creation and verification |
| cors | `^2.8.5` | Browser cross-origin policy |
| helmet | installed in server package | Security response headers |
| express-rate-limit | installed in server package | API and authentication throttling |
| dotenv | `^16.4.5` | Server environment variables |
| PDFKit | `^0.15.0` | Server-side PDF ticket generation |
| qrcode | `^1.5.4` | QR image generation inside PDF tickets |
| Nodemon | `^3.1.14` | Development restart watcher |

There is no Stripe, MTN MoMo API SDK, Orange Money API SDK, email SDK, SMS SDK, rate-limit package, or automated test framework installed at this time.

## 4. Project Structure

```text
SmithGo-Express-Fixed (1)/
├── README.md
├── SMITHGO_EXPRESS_TECHNICAL_MANUAL.md
├── package-lock.json
├── client/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       │   ├── AgencyCard.jsx
│       │   └── Navbar.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── lib/
│       │   └── api.js
│       └── pages/
│           ├── Admin.jsx
│           ├── Agencies.jsx
│           ├── Auth.jsx
│           ├── Book.jsx
│           ├── Bookings.jsx
│           ├── Confirmation.jsx
│           ├── Home.jsx
│           └── ...
└── server/
    ├── package.json
    ├── package-lock.json
    ├── .env.example
    └── src/
        ├── server.js
        ├── config/db.js
        ├── controllers/
        ├── middleware/auth.js
        ├── models/
        ├── routes/
        └── utils/seedAgencies.js
```

Important ownership boundaries:

- `client/src/pages`: full screens and user workflows.
- `client/src/components`: reusable visual elements.
- `client/src/context`: authentication state and local storage synchronization.
- `client/src/lib/api.js`: API base URL, JWT header, JSON/blob response handling.
- `server/src/server.js`: environment loading, CORS, parsing, route mounting, database startup, and health check.
- `server/src/routes`: URL and middleware declarations.
- `server/src/controllers`: business rules and database operations.
- `server/src/models`: MongoDB document schemas.
- `server/src/middleware/auth.js`: JWT and role checks.

## 5. Prerequisites

Install the following on Windows:

1. **Node.js LTS:** required for both frontend and backend. Obtain it from the official Node.js website. Verify with:

   ```powershell
   node --version
   npm --version
   ```

   The repository does not declare an exact Node version. Use a currently supported LTS release compatible with Vite 6 and Node's ES module support.

2. **VS Code:** recommended editor for the project.

3. **Git:** required for source control and GitHub. Verify with:

   ```powershell
   git --version
   ```

4. **MongoDB Atlas or local MongoDB:** the server requires a reachable MongoDB URI. Atlas is the recommended hosted development database.

5. **A modern browser:** Chrome, Edge, or Firefox for the React application. Mobile USSD handoff requires a phone browser with a dialer-capable device; desktop browsers generally cannot execute a USSD session.

Do not type the PowerShell prompt itself. If the terminal shows `PS C:\...\client>`, type only the command after it.

## 6. Environment Configuration

### Server environment

Create `server/.env` locally. Never copy real secrets into documentation or GitHub.

```dotenv
PORT=5001
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

The checked-in `server/.env.example` uses a local MongoDB placeholder. The actual local `.env` in this workspace contains credentials and must remain private.

| Variable | Purpose |
|---|---|
| `PORT` | Express listening port. The project default is `5001`. |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign and verify login tokens. |
| `CLIENT_URL` | Allowed browser origin for CORS. |

### Client environment

Create `client/.env` when overriding defaults:

```dotenv
VITE_API_URL=http://localhost:5001/api
VITE_ORANGE_MONEY_USSD_CODE=#150#
VITE_MTN_MOMO_USSD_CODE=*126#
```

Vite variables are public and are bundled into the browser. USSD codes are not secrets. Never put `MONGO_URI`, `JWT_SECRET`, merchant API secrets, or private credentials in `client/.env` or React code.

`#150#` is published by the official Orange Money Cameroon site. The MTN value is configurable and must be verified against MTN Cameroon before production use because operators can change menu codes.

## 7. Install and Run

### Backend

```powershell
cd "PATH_TO_PROJECT\server"
npm install
npm run dev
```

Expected successful output:

```text
MongoDB connected
API running on 5001
Client URL: http://localhost:5173
Health: http://localhost:5001/api/health
```

Start without Nodemon with:

```powershell
npm start
```

### Frontend

Open a second terminal:

```powershell
cd "PATH_TO_PROJECT\client"
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

### Production frontend build

```powershell
cd "PATH_TO_PROJECT\client"
npm run build
npm run preview
```

### Seed sample agencies

After configuring `server/.env`:

```powershell
cd "PATH_TO_PROJECT\server"
npm run seed:agencies
```

This creates eight clearly marked sample records using upsert behavior. It does not create schedules, prices, payment credentials, or verified operator contacts. Verify every operator and route before accepting real bookings.

## 8. MongoDB Atlas

1. Create an account at MongoDB Atlas.
2. Create an organization and project for SmithGo Express.
3. Create a development cluster using an available low-cost/free tier.
4. Create a database user with a strong password.
5. In Network Access, add the development IP address. Avoid `0.0.0.0/0` for production unless you understand the exposure.
6. Choose **Connect**, then **Drivers**, and copy the connection string.
7. Replace placeholders locally only:

   ```dotenv
   MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/smithgo_express?retryWrites=true&w=majority
   ```

8. Restart the server and look for `MongoDB connected`.
9. Open `http://localhost:5001/api/health` and verify the JSON health response.

URI parts:

- `USERNAME`: Atlas database user.
- `PASSWORD`: URL-encoded database password.
- `CLUSTER`: Atlas cluster hostname.
- `smithgo_express`: database name.
- query options: driver write/retry settings.

Collections are created by Mongoose when data is first written. Current application collections are `users`, `agencies`, `schedules`, `bookings`, `payments`, and `notifications`.

## 9. Database Models

### User

Location: `server/src/models/User.js`

- `name`: required string.
- `email`: required, unique, lowercase string.
- `phone`: optional string.
- `password`: required bcrypt hash.
- `role`: `customer`, `admin`, or `agency_manager`.
- `active`: defaults to `true`.
- timestamps: `createdAt`, `updatedAt`.

### Agency

Location: `server/src/models/Agency.js`

- `name`: required string.
- `slug`: unique optional string.
- `logo`, `description`, `phone`, `email`, `address`, `website`: optional strings.
- `active`: defaults to `true`.
- `routes`: array of strings.
- timestamps.

### Schedule

Location: `server/src/models/Schedule.js`

- `agency`: required Agency reference.
- `from`, `to`: required route strings.
- `departureDate`: required `YYYY-MM-DD` string.
- `departureTime`: required `HH:mm` string.
- `durationMinutes`: default `180`.
- `price`: required non-negative number.
- `currency`: defaults to `XAF`.
- `capacity`: required seat capacity.
- `availableSeats`: decremented atomically during booking.
- `active`: defaults to `true`.

Indexes support agency/date and route/date searches.

### Booking

Location: `server/src/models/Booking.js`

- `reference`: unique public booking reference such as `SGX-...`.
- `ticketId`: unique ticket identifier.
- `user`, `agency`, `schedule`: references.
- `trip`: route/date/time/seat type snapshot.
- `passenger`: name, phone, email, ID number.
- `seats`: number of seats.
- `amount`, `currency`: server-calculated fare.
- `paymentMethod`: `mobile_money`, `agency_paid`, or `admin_pays`.
- `paymentRequired`: boolean.
- `paymentStatus`: `pending`, `submitted`, `paid`, `failed`, `refunded`, `cancelled`, or legacy `unpaid`.
- `status`: `payment_pending`, `confirmed`, `checked_in`, `completed`, `cancelled`, `refunded`, or `expired`.

### Payment

Location: `server/src/models/Payment.js`

- `user`, `booking`, `agency`: references.
- `amount`, `currency`.
- `method`: `mobile_money`, `agency_paid`, or `admin_pays`.
- `merchantNumber`: currently `+237 678949296`.
- sender name/phone, transaction reference, amount sent.
- `status`: `pending`, `submitted`, `paid`, `failed`, `refunded`, or `cancelled`.
- submission and verification timestamps.
- verifying administrator and note.

### Notification

Location: `server/src/models/Notification.js`

- recipient `user` reference.
- type: registration, booking, payment, cancellation, or system.
- title, message, read flag.
- optional booking/payment references.
- timestamps and unread index.

## 10. Authentication

Registration flow:

```text
React Auth form
  -> POST /api/auth/register
  -> validate name/email/password
  -> check duplicate email
  -> bcrypt.hash(password, 12)
  -> create User
  -> sign JWT for 7 days
  -> return token and safe user fields
  -> AuthContext stores token/user in localStorage
```

Login uses email lookup, `bcrypt.compare`, inactive-account rejection, and JWT creation. The JWT contains user ID, role, name, and email and expires after seven days.

`client/src/context/AuthContext.jsx` stores:

- token under `sg_token`;
- user under `smithgo_user`.

`client/src/lib/api.js` attaches `Authorization: Bearer <token>` when available.

Logout clears both local storage values and React state.

The server's `auth` middleware verifies the token. `admin` restricts administrator endpoints. `adminOrManager` permits `admin` and `agency_manager` for agency/schedule operations. Customers cannot access administrative APIs.

## 11. API Reference

All API URLs below are relative to `http://localhost:5001` in development. JSON requests use `Content-Type: application/json`.

### Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create customer and return JWT. |
| POST | `/api/auth/login` | No | Verify credentials and return JWT. |

Registration body: `{ name, email, phone, password }`. Login body: `{ email, password }`.

### Health

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | API health check. |

### Agencies

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/agencies` | No | List active agencies. |
| GET | `/api/agencies/manage` | Admin/manager | List all agencies. |
| POST | `/api/agencies` | Admin/manager | Create agency. |
| PUT | `/api/agencies/:id` | Admin/manager | Update agency. |
| DELETE | `/api/agencies/:id` | Admin/manager | Archive agency. |

### Schedules

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/schedules` | No | Search active departures. Supports `agency`, `date`, `from`, and `to`. |
| GET | `/api/schedules/manage` | Admin/manager | List all schedules. |
| POST | `/api/schedules` | Admin/manager | Publish a departure. |
| PUT | `/api/schedules/:id` | Admin/manager | Update a departure. |
| DELETE | `/api/schedules/:id` | Admin/manager | Archive a departure. |

### Bookings

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/bookings` | Yes | Reserve available seats. Price is calculated server-side. |
| GET | `/api/bookings/mine` | Yes | Return only the current user's bookings. |
| GET | `/api/bookings/all` | Admin | Return all bookings. |
| PATCH | `/api/bookings/:id/cancel` | Yes | Cancel the current user's booking and release seats. |
| GET | `/api/bookings/:id/ticket` | Yes | Generate a provisional reservation PDF or confirmed ticket for the booking owner. |

Booking body uses `{ schedule, seats, seatType, paymentMode, passenger }`. Customers must use `paymentMode: customer_pays`; only admins can use `agency_paid` or `admin_pays`.

### Payments

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/payments/mine` | Yes | Current user's payment records. |
| GET | `/api/payments/booking/:bookingId` | Yes | Payment state for a user's booking. |
| POST | `/api/payments/booking/:bookingId/submit` | Yes | Submit Mobile Money evidence. |
| GET | `/api/payments` | Admin | List payment records for review. |
| PATCH | `/api/payments/:id/verify` | Admin | Mark payment paid, failed, refunded, or cancelled. |

Payment submission requires `senderName`, `senderPhone`, `transactionReference`, and `amountSent`. The amount must equal the server-calculated booking amount.

### Users

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/users` | Admin | List users; optional `search` query. |
| GET | `/api/users/:id/bookings` | Admin | View a user's booking history. |
| PATCH | `/api/users/:id` | Admin | Update name, email, phone, role, active state, or password. |
| DELETE | `/api/users/:id` | Admin | Soft-deactivate a user. |

### Notifications

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/notifications` | Yes | List current user's notifications. |
| GET | `/api/notifications/unread` | Yes | Return unread count. |
| PATCH | `/api/notifications/:id/read` | Yes | Mark one notification read. |

### Audit logs

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/audit` | Admin | List protected audit records for sensitive administration actions. |

## 12. Agencies and Schedules

Customers see active agencies through `GET /api/agencies`. Operators are stored as MongoDB documents; schedules are separate documents so capacity, date, time, and price can vary by departure.

The administrator or agency manager publishes a schedule with an agency, route, date, time, price, currency, and capacity. The server initializes `availableSeats` from capacity. A booking uses an atomic `findOneAndUpdate` with an `availableSeats >= requestedSeats` condition, preventing simple overbooking races.

The seed command adds sample records for:

- Vatican Express
- Finexs Voyages
- Buca Voyages
- General Voyages
- Musango Bus
- Amour Mezam
- United Express
- Nso Boys

These are sample records for configuration, not verified partnerships or live schedules. Confirm the operator, contact details, routes, and permission to list them before production use.

## 13. Booking Workflow

```text
Customer logs in
  -> selects agency/departure
  -> enters passenger data
  -> server validates schedule and capacity
  -> server calculates price
  -> server reserves seats
  -> booking is payment_pending
  -> customer submits Mobile Money evidence
  -> admin verifies
  -> payment=paid and booking=confirmed
  -> ticket PDF is available
```

If payment is rejected, the booking is not confirmed. If a booking is cancelled, reserved seats are returned to the schedule. A paid cancellation changes the payment state to `refunded`, but no external refund is sent automatically because no payment provider API is connected.

## 14. Mobile Money Workflow

Merchant number: **+237 678949296**.

The current system is **manual verification**, not automated operator settlement. No MTN or Orange merchant API credentials are present, and no payment SDK is installed. The backend never trusts a frontend `paid` flag.

On the payment screen:

1. Customer selects Orange Money or MTN MoMo.
2. Customer taps the explicit USSD button.
3. On a compatible phone, the browser hands off to the dialer using `tel:`.
4. The customer completes the operator menu, enters the merchant number and exact amount, and enters their PIN themselves.
5. The customer returns to SmithGo Express and submits sender name, sender phone, transaction reference, and amount.
6. The backend stores a `Payment` record as `submitted` and leaves booking status `payment_pending`.
7. An admin reviews the real transaction through the operator's merchant records and chooses Verify or Reject.
8. Only Verify changes the payment to `paid`, booking to `confirmed`, and unlocks the ticket.

A web page cannot automatically dial a USSD code and cannot safely enter a Mobile Money PIN. This implementation is the correct non-credentialed fallback. To automate verification, obtain an official business/merchant integration from the operator or a regulated payment gateway and add server-side secrets only.

The Orange code currently defaults to `#150#`, based on the official Orange Money Cameroon site. The MTN code is configurable and must be confirmed with MTN Cameroon before production. See `client/.env.example`.

## 15. Tickets

The server generates reservation or confirmed tickets with PDFKit; the browser does not screenshot the page. Unpaid downloads are explicitly provisional and are not proof of payment or boarding. A verified/sponsored ticket includes:

- SmithGo Express branded header.
- Online booking ticket title.
- Booking reference.
- Unique ticket ID.
- QR code containing the reference and ticket ID.
- Agency, passenger, email, phone, route, date, time, seat count, amount, payment, status, and generation date.
- Filename `SmithGo-Ticket-SGX-XXXXXX.pdf`.

The QR code is an encoded ticket payload containing the reference, ticket ID, booking status, and payment status, not a public verification endpoint or scan/check-in system. **QR verification and ticket scanning are NOT YET IMPLEMENTED.** Print is currently the browser print action on the confirmation page; a separate HTML ticket route is not implemented.

## 16. Customer Experience

Implemented customer pages include home, agency browse/search, registration/login, schedule-based booking, payment submission, confirmation, and My Trips.

My Trips supports:

- all bookings;
- upcoming bookings;
- past bookings;
- cancelled bookings;
- payment/status labels;
- ticket download when eligible;
- cancellation for eligible confirmed trips.

The notification bell displays the unread count from `/api/notifications/unread`. A full profile/settings page, customer payment-history page, and dedicated notifications page are **NOT YET IMPLEMENTED**.

## 17. Administration

The existing admin page supports:

- dashboard counts for bookings, confirmed reservations, and agencies;
- agency creation;
- agency updates through the API contract, although the current compact UI does not expose every agency field;
- departure publishing and archiving;
- payment list and Verify/Reject actions;
- user list, role changes, and activation/deactivation;
- recent bookings;
- persisted admin notifications created for bookings and payment submissions.
- protected audit records for payment verification and user-management changes.

The admin page does not yet provide full charts, revenue reports, booking editing, ticket reissue, a dedicated notification center, bulk actions, audit logs, or a separate agency-manager dashboard. Those items are **NOT YET IMPLEMENTED**.

When an admin verifies a payment, the backend automatically sets:

```text
Payment.status = paid
Booking.paymentStatus = paid
Booking.status = confirmed
```

When an admin rejects it, the payment becomes `failed` and the booking remains unconfirmed/payment-pending.

## 18. UI and UX

The existing design uses:

- DM Sans and Manrope from Google Fonts;
- dark ink, white paper, lime accent, and soft neutral surfaces;
- Lucide icons;
- Framer Motion on selected cards/pages;
- responsive CSS media queries at the mobile breakpoint;
- sticky navigation and mobile menu;
- loading, empty, success, and error states.

The UI is intentionally branded for SmithGo Express rather than a default component library. Some screens remain compact JSX files and need further accessibility and visual refinement. Skeleton loading, a dedicated toast system, and a complete mobile-first admin information architecture are **NOT YET IMPLEMENTED**.

## 19. Security

Implemented:

- bcrypt password hashing with cost 12 during registration;
- JWT authentication with seven-day expiration;
- protected user, booking, payment, schedule, and admin routes;
- customer booking queries scoped by `req.user.id`;
- backend-controlled schedule price and seat availability;
- ticket payment gate;
- payment status changes restricted to admin verification;
- environment variables for server secrets;
- CORS origin configuration;
- MongoDB schema validation and unique indexes for key fields;
- inactive account rejection at login.

Recommended before production:

- rate limiting and login throttling;
- stronger request validation library and reusable ID validation;
- refresh-token rotation or shorter access-token lifecycle;
- security headers such as Helmet;
- audit logs for admin payment decisions;
- encrypted/managed production secrets;
- email or SMS notification delivery;
- external payment webhooks and signature verification;
- privacy policy, retention policy, and access review;
- automated tests and monitoring.

## 20. Testing

There is no automated test suite in the repository. Use this manual checklist:

### Accounts

- Register valid customer.
- Reject duplicate email.
- Reject missing required fields.
- Login with correct credentials.
- Reject wrong password.
- Reject inactive account.
- Logout and verify local storage clears.

### Agencies and schedules

- Browse active agencies.
- Log in as admin.
- Add agency.
- Publish future departure.
- Confirm customer sees departure.
- Archive departure and confirm it disappears from public search.

### Booking and payment

- Reserve available seats.
- Confirm server calculates amount.
- Confirm booking starts `payment_pending`.
- Tap Orange/MTN dialer action on a mobile device.
- Submit exact Mobile Money details.
- Confirm payment appears for admin.
- Verify payment and confirm booking becomes `confirmed`.
- Reject payment and confirm the reservation PDF remains marked provisional.
- Confirm customer cannot send an incorrect amount.
- Cancel booking and confirm seats return.

### Ticket

- Download an unpaid reservation PDF and confirm it is marked payment pending/not confirmed.
- Verify payment and download PDF.
- Confirm branded header, QR, ticket ID, status, and filename.
- Use browser print action.
- QR scanning currently only proves payload generation; public verification is not implemented.

### Authorization

- Call admin endpoint without token: expect `401`.
- Call admin endpoint as customer: expect `403`.
- Access another user's booking: expect `404`.
- Verify invalid/expired JWT returns `401`.

## 21. Troubleshooting

| Problem | Checks |
|---|---|
| Frontend does not start | Run `npm install` inside `client`; check Node version; run `npm run dev`. |
| Backend does not start | Run `npm install` inside `server`; check `.env`; inspect syntax output; check whether port `5001` is already used. |
| MongoDB connection fails | Check `MONGO_URI`, Atlas network access, database username/password, and URL encoding. |
| Request failed | Inspect browser Network tab, API URL, response status, backend terminal, and CORS `CLIENT_URL`. |
| Login returns 404 | Confirm server mounts `/api/auth`, routes/auth.js defines `POST /login`, and client uses `/auth/login`. |
| Login returns 401 | Check email/password and whether the account exists. |
| Login returns 403 | The account is inactive. An admin must activate it. |
| Payment button does not open dialer | Use a phone browser; desktop browsers may not support USSD. Use the operator app or dial code manually. |
| MTN code fails | Verify the current Cameroon MTN code and update `VITE_MTN_MOMO_USSD_CODE`. |
| Ticket returns 402 | Payment is not verified. This is intentional. |
| PDF fails | Inspect server logs, confirm PDFKit/QRCode dependencies, and retry after restarting backend. |
| Port conflict | Change `PORT` in `server/.env` and update `VITE_API_URL` consistently. |

## 22. GitHub

Before pushing, verify `.env` is ignored and remove any exposed credentials. Never push MongoDB passwords, JWT secrets, payment credentials, or customer secrets.

```powershell
git init
git add .
git commit -m "Initial SmithGo Express project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

If a secret was ever committed, rotate it immediately. Removing it from a later commit is not enough.

## 23. Deployment

The repository has no provider-specific deployment configuration. **Production hosting is NOT YET CONFIGURED.**

Recommended shape:

```text
Frontend: Vercel/Netlify/static host
Backend: Node-capable host
Database: MongoDB Atlas
Payment: official operator/gateway merchant integration
```

Production changes:

- Set the backend `MONGO_URI` and a strong unique `JWT_SECRET` in the hosting provider's secret manager.
- Set `PORT` according to the hosting platform.
- Set `CLIENT_URL` to the real frontend origin.
- Set frontend `VITE_API_URL` to the deployed API base URL.
- Configure HTTPS.
- Restrict MongoDB Atlas network access to backend egress addresses where possible.
- Configure official payment credentials only on the backend.
- Configure webhook URLs and signature secrets if a real provider is added.
- Do not use development sample agencies or unverified routes as live inventory.

## 24. Remaining Work

### Completed

- React/Vite frontend and Express/Mongoose backend.
- MongoDB connection and core models.
- JWT authentication and bcrypt password hashing.
- Agency browsing and management.
- Schedule-based capacity and server-side fare calculation.
- Payment-pending Mobile Money workflow.
- User-submitted payment evidence and admin verification.
- Payment-aware ticket generation with clearly marked provisional reservation PDFs and confirmed paid PDFs.
- QR-containing branded PDF ticket.
- User management and agency-manager role support.
- Notification persistence and unread count.
- Customer booking filters and cancellation.
- Configurable Cameroon USSD dialer handoff.
- Sample agency seed command.

### Partially Completed

- Mobile Money is manual verification, not automatic settlement.
- QR payload exists, but public scan verification/check-in does not.
- Admin controls exist, but advanced reports and workflows are limited.
- Agency manager role exists in authorization, but has no dedicated UI.
- Browser print exists, but there is no separate HTML ticket viewer.
- Agency records and sample names require operational verification.

### Not Yet Implemented

- Official MTN MoMo or Orange Money API integration.
- Automatic payment webhooks and reconciliation.
- Email/SMS ticket notifications.
- Customer profile/settings screen.
- Dedicated payment history and notification pages.
- Revenue charts, reports, exports, and audit logs.
- Seat map/seat number inventory.
- Booking edit, reissue, check-in, or scanner workflow.
- Automated test suite and end-to-end browser tests.
- Rate limiting, security headers, and production observability.

### Requires External Credentials

- MongoDB Atlas production account/URI.
- Production hosting accounts.
- Official MTN/Orange merchant or payment gateway credentials.
- Email/SMS provider credentials.
- Any production domain and TLS configuration.

## 25. Start Here

1. Install Node.js LTS, VS Code, Git, and a browser.
2. Create MongoDB Atlas project, cluster, database user, and network rule.
3. Copy the project into a local folder and open it in VS Code.
4. Create `server/.env` from `server/.env.example`.
5. Put the real MongoDB URI and a long JWT secret only in `server/.env`.
6. Install and start the backend:

   ```powershell
   cd "PATH_TO_PROJECT\server"
   npm install
   npm run dev
   ```

7. Verify `http://localhost:5001/api/health`.
8. In another terminal install and start the frontend:

   ```powershell
   cd "PATH_TO_PROJECT\client"
   npm install
   npm run dev
   ```

9. Open `http://localhost:5173`.
10. Register a customer account.
11. Promote a controlled test account to admin in MongoDB, or use an existing admin.
12. Open `/admin` and add/verify an agency.
13. Publish a future departure with price and capacity.
14. Open the booking page as a customer.
15. Reserve seats and continue to payment.
16. On a phone, choose the operator and tap the USSD button. Complete the transfer to `+237 678949296`.
17. Submit the transaction reference and exact amount.
18. Log in as admin and verify the submitted payment.
19. Return as customer and download the PDF ticket.
20. Test print, cancellation, authorization, and sold-out behavior.
21. Build the frontend:

   ```powershell
   cd "PATH_TO_PROJECT\client"
   npm run build
   ```

22. Before production, verify operator credentials, real agency agreements, payment reconciliation, privacy/security controls, and deployment environment variables.
