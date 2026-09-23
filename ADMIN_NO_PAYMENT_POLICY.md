# SmithGo Express — Admin Ticket Without Payment

The payment rule is now enforced server-side:

- **CUSTOMER:** booking starts as `pending_payment` and must complete Flutterwave payment before becoming `confirmed`.
- **ADMIN:** can create a confirmed ticket directly without a Flutterwave transaction.
- The admin's complimentary/direct booking is stored with `paymentStatus: paid` because the booking is issued by an administrator without a customer payment transaction. It does **not** create a fake Flutterwave payment record.
- The backend determines admin status from the authenticated JWT role. The client cannot grant itself admin privileges.
- Customers cannot bypass payment by calling the admin behavior from the browser.
- Admins can download tickets for bookings they issue.
- Admins can also view/download tickets for existing bookings.

## Admin flow

1. Sign in with an account whose database role is `admin`.
2. Open **Book**.
3. Complete the passenger/trip details.
4. Click **Issue ticket without payment**.
5. SmithGo creates the booking as `confirmed`.
6. No Flutterwave checkout is created.
7. The ticket can be downloaded.

## Customer flow

1. Sign in as a normal customer.
2. Complete the booking.
3. SmithGo creates the booking as `pending_payment`.
4. Flutterwave checkout opens.
5. The booking becomes confirmed only after successful provider verification.

Do not change a customer account's role to `admin` through the frontend. Role assignment must remain an authenticated server/database operation.
