# SmithGo Express Deployment and Ticket Update

## Deployment Summary

This project has two separately deployed applications:

```text
Netlify          -> client/ React + Vite frontend
Backend host     -> server/ Express + Node.js API
MongoDB Atlas    -> database
```

Netlify hosts the frontend only. The current Express API must run on a Node-capable service such as Render, Railway, Fly.io, or another managed Node host.

## Frontend on Netlify

Use these Netlify build settings:

```text
Base directory: client
Build command: npm run build
Publish directory: dist
```

Set this Netlify environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

The client includes `client/public/_redirects`:

```text
/* /index.html 200
```

That rule is required because React Router handles `/bookings`, `/privacy`, `/terms`, `/faq`, and other routes in the browser. Without it, refreshing a deep link can return a Netlify 404.

## Backend on Render/Railway

Use the `server` directory as the service root.

```text
Build command: npm install
Start command: npm start
```

Configure private server environment variables:

```text
PORT=10000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/smithgo_express
JWT_SECRET=GENERATE_A_NEW_LONG_SECRET
CLIENT_URL=https://YOUR-NETLIFY-DOMAIN.netlify.app
```

The backend must expose:

```text
GET /api/health
```

Verify it before connecting Netlify:

```text
https://YOUR-BACKEND-DOMAIN/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "SmithGo Express",
  "message": "API is running successfully"
}
```

## Custom Domain

1. Deploy the Netlify site first.
2. Test the generated `*.netlify.app` address.
3. In Netlify, open **Domain management**.
4. Add a domain you own or register one through Netlify.
5. Follow the DNS records Netlify displays at your registrar.
6. Wait for DNS propagation.
7. Enable the Netlify-provided HTTPS certificate.
8. Change the backend `CLIENT_URL` to the final HTTPS frontend domain.
9. Redeploy the backend.
10. Update Netlify `VITE_API_URL` if the API domain changes.

Do not guess DNS A/CNAME values. Use the exact records Netlify provides.

## Changed Ticket Behavior

A customer can now download a PDF before payment verification. This is intentionally a **reservation ticket**, not a paid boarding ticket.

### Unverified reservation PDF

The PDF says:

```text
RESERVATION TICKET - PAYMENT PENDING
Payment: PENDING VERIFICATION
Status: PAYMENT PENDING - NOT CONFIRMED
```

It also includes a warning:

```text
This reservation ticket is not proof of payment or a confirmed boarding ticket.
Complete payment and wait for verification before travel.
```

### Verified ticket PDF

After an administrator verifies the Mobile Money payment, the same download endpoint generates a confirmed ticket with:

```text
ONLINE BOOKING TICKET
Payment: PAID
Status: confirmed
```

The QR payload includes the booking reference, ticket ID, booking status, and payment status. A public QR scanning/validation endpoint is still not implemented.

### Why this distinction matters

The customer gets a useful record immediately, but the system does not falsely represent an unpaid booking as paid. Agencies should accept boarding only when the payment and booking status are confirmed according to the operator's business process.

## Deployment Checklist

- [ ] Rotate any secret that has ever been shared.
- [ ] Keep `server/.env` out of GitHub.
- [ ] Create MongoDB Atlas production credentials.
- [ ] Configure Atlas network access for the backend host.
- [ ] Deploy the backend and verify `/api/health`.
- [ ] Set `CLIENT_URL` to the real frontend HTTPS domain.
- [ ] Deploy `client/` to Netlify.
- [ ] Set `VITE_API_URL` in Netlify.
- [ ] Confirm the Netlify SPA fallback is deployed.
- [ ] Attach the custom domain.
- [ ] Confirm HTTPS.
- [ ] Test registration and login.
- [ ] Test customer booking and reservation PDF.
- [ ] Test Mobile Money submission.
- [ ] Test admin verification and confirmed PDF.
- [ ] Test logout, cancellation, and unauthorized routes.
