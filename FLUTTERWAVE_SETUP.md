# SmithGo Express — Flutterwave Payment Setup

SmithGo Express now uses Flutterwave Standard Checkout. Flutterwave's current documentation supports Cameroon Mobile Money in XAF (MTN and Orange Money), and Standard Checkout returns a hosted payment link. The server verifies the transaction before confirming a booking.

## 1. Create/approve your Flutterwave account

Create a Flutterwave account and use the test environment first. Live payments require account approval/KYC.

## 2. Add server environment variables

Copy `server/.env.example` to `server/.env` and keep your existing MongoDB Atlas URI and JWT secret. Add:

```env
FLW_PUBLIC_KEY=FLWPUBK_TEST-...
FLW_SECRET_KEY=FLWSECK_TEST-...
FLW_SECRET_HASH=a_random_webhook_secret
SERVER_PUBLIC_URL=https://YOUR_PUBLIC_API_DOMAIN
```

Never put `FLW_SECRET_KEY` in the React/client `.env`.

## 3. Local testing

Flutterwave must be able to redirect to and call your backend. `localhost` is not reachable from Flutterwave's servers, so expose your local server through an HTTPS tunnel.

Example with ngrok:

```bash
ngrok http 5000
```

If ngrok gives you `https://abc123.ngrok-free.app`, use:

```env
SERVER_PUBLIC_URL=https://abc123.ngrok-free.app
```

Your webhook endpoint is:

```text
https://abc123.ngrok-free.app/api/payments/flutterwave/webhook
```

Your callback endpoint is:

```text
https://abc123.ngrok-free.app/api/payments/flutterwave/callback
```

Set the webhook URL in Flutterwave Dashboard → Settings → Webhooks and use the same value for `FLW_SECRET_HASH`.

## 4. Install and run

From `server`:

```bash
npm install
npm run dev
```

From `client`:

```bash
npm install
npm run dev
```

## 5. Payment flow

1. Customer creates a booking.
2. SmithGo stores it as `pending_payment`.
3. SmithGo creates a Flutterwave transaction with a unique `tx_ref`.
4. Customer is redirected to Flutterwave Checkout.
5. Customer selects an available payment method, including supported Cameroon Mobile Money options when enabled for the account.
6. Flutterwave redirects back to SmithGo and can send a webhook.
7. SmithGo verifies the transaction server-side using Flutterwave's verification endpoint.
8. SmithGo compares transaction reference, amount and currency.
9. Only then does the booking become `confirmed` and `paymentStatus` become `paid`.
10. The customer can download the ticket.

## 6. Important

The ZIP intentionally does **not** include your real Flutterwave secret key or your MongoDB credentials. Put those in your local `server/.env`.

The integration is complete in code, but live money cannot be tested from this ZIP without your Flutterwave merchant credentials and a publicly reachable backend/webhook URL.
