# SmithGo Express — MERN Online Booking System

A Cameroon-focused transportation booking application built with React, Express, Node.js and MongoDB Atlas.

## Payment integration

SmithGo now integrates **Flutterwave Standard Checkout** for real payment processing. The customer is redirected to Flutterwave's hosted checkout, and SmithGo only confirms a booking after the backend verifies the transaction. This supports Flutterwave's available payment methods for the account, including Cameroon XAF Mobile Money options when enabled.

### Required environment variables

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=YOUR_EXISTING_MONGODB_ATLAS_URI
JWT_SECRET=YOUR_SECRET
CLIENT_URL=http://localhost:5173
SERVER_PUBLIC_URL=https://YOUR_PUBLIC_BACKEND_DOMAIN
FLW_PUBLIC_KEY=FLWPUBK_TEST-...
FLW_SECRET_KEY=FLWSECK_TEST-...
FLW_SECRET_HASH=YOUR_WEBHOOK_SECRET_HASH
```

**Never commit `server/.env`.** The distributed project intentionally contains only `.env.example`.

## Run locally

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Flutterwave webhook

Configure this URL in the Flutterwave Dashboard:

```text
https://YOUR_PUBLIC_BACKEND_DOMAIN/api/payments/flutterwave/webhook
```

Flutterwave's callback URL is:

```text
https://YOUR_PUBLIC_BACKEND_DOMAIN/api/payments/flutterwave/callback
```

For local development, expose port 5000 with an HTTPS tunnel such as ngrok or Cloudflare Tunnel and put that public URL in `SERVER_PUBLIC_URL`.

See **FLUTTERWAVE_SETUP.md** for the full setup and testing checklist.

## Payment lifecycle

```text
Booking created (pending_payment)
        ↓
Flutterwave checkout created
        ↓
Customer pays
        ↓
Flutterwave webhook / callback
        ↓
SmithGo verifies transaction server-side
        ↓
Reference + amount + currency checked
        ↓
Payment SUCCESS
        ↓
Booking CONFIRMED
        ↓
Ticket available
```

A frontend button click or redirect alone never marks a booking as paid.
