# SmithGo Express — MERN Online Booking System

See [SMITHGO_EXPRESS_TECHNICAL_MANUAL.md](SMITHGO_EXPRESS_TECHNICAL_MANUAL.md) for the complete architecture, setup, API, database, Mobile Money, testing, troubleshooting, deployment, and remaining-work documentation.

See [SMITHGO_EXPRESS_CAMEROON_COMPLIANCE_AUDIT.md](SMITHGO_EXPRESS_CAMEROON_COMPLIANCE_AUDIT.md) for the technical compliance audit, legal-risk matrix, data inventory, traceability evidence, and go-live checklist. This report does not certify legal compliance.

A full-stack bus/intercity booking platform built with MongoDB, Express, React and Node.js.

## Included
- Modern responsive React UI with Framer Motion animations and Lucide icons
- Customer registration/login with JWT authentication
- Agency directory and search
- Admin agency management: add, edit, archive, logo URL, contact details and routes
- Booking workflow with passenger + trip details
- User booking history
- Downloadable PDF booking tickets
- Admin booking overview
- No XAMPP required

## Run locally
### 1. MongoDB
Use either a local MongoDB server or MongoDB Atlas. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`.

### 2. Server
```bash
cd server
npm install
npm run dev
```

### 3. Client
Open a second terminal:
```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally http://localhost:5173.

## Make an admin
Register a normal account, then in MongoDB change its `role` field from `customer` to `admin`. The Admin page will then appear.

## Future production upgrades
Payments (MTN MoMo/Orange Money), seat maps, real-time schedules, email/SMS confirmations, QR codes, agency-specific staff accounts, route/price management and cloud image storage can be added cleanly to this architecture.

## Fixes applied in this update

The previous zip had three real bugs that stopped the app from ever showing your actual pages:

1. **`client/src/App.jsx` was a placeholder.** It defined its own inline `Home`/`404` and never imported your real pages, `Navbar`, or `AuthContext` — so none of your built pages (Agencies, Auth, Book, Bookings, Admin, Confirmation) were reachable no matter what you typed in the URL. Rewritten to route to all of them, with `/bookings`, `/confirmation`, and `/admin` requiring login (and `/admin` requiring the admin role).
2. **Login/register didn't actually call the API.** `AuthContext`'s `login` only set local state and had no `register` function at all, even though `Auth.jsx` calls `await login(...)` and `await register(...)` expecting both to hit the server and throw on failure. Both are now real, async, and match your server's actual response shape (`{ token, user }`).
3. **Token key mismatch.** `lib/api.js` reads the auth token from `localStorage` under `"sg_token"` on every request, but `AuthContext` was saving it under `"smithgo_token"` — so even a successful login would look unauthenticated to every subsequent request (bookings, admin). Both now use `"sg_token"`.

Also fixed: `client/index.html` was a bare fragment (no `<html>`/`<head>`/`<body>`, no charset/viewport/title) — now a complete HTML5 document.

## Important: install dependencies fresh, don't reuse old `node_modules`

This zip does **not** include `node_modules` or `package-lock.json` on purpose. The previous zip's `node_modules` was installed on Windows and broke immediately on any other machine/OS with:

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

This is a known npm bug with optional platform-specific dependencies (npm/cli#4828), and Vite/Rollup/esbuild all hit it. The fix is simply: never commit or zip `node_modules`. Run `npm install` fresh in both `client/` and `server/` on whatever machine you're actually running the app on, and npm will pull the correct binaries for that platform automatically.

If you ever see a similar "Cannot find module `@something/platform-name`" error again in the future, the fix is always the same: delete `node_modules` and `package-lock.json` in that folder, then run `npm install` again on the machine you're actually running it on.

## Security note

`server/.env` and `server/atlas-credentials.env` (your real MongoDB Atlas credentials) are **not** included in this zip — only `.env.example` files with placeholder values. Recreate your real `.env` locally from `server/.env.example` and never commit or share the real one.
