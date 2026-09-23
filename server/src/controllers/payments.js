import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

const FLW_BASE = 'https://api.flutterwave.com/v3';

function requireFlutterwave(res) {
  if (!process.env.FLW_SECRET_KEY) {
    res.status(503).json({
      message: 'Flutterwave is not configured yet. Add FLW_SECRET_KEY to server/.env and restart the API.'
    });
    return false;
  }
  return true;
}

async function flwFetch(path, options = {}) {
  const response = await fetch(`${FLW_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.status === 'error') {
    const message = body.message || `Flutterwave request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function verifyAndApply(transactionId, expectedPayment) {
  const result = await flwFetch(`/transactions/${encodeURIComponent(transactionId)}/verify`);
  const tx = result?.data;
  if (!tx) throw new Error('Flutterwave returned no transaction data.');

  const sameReference = tx.tx_ref === expectedPayment.txRef;
  const successful = String(tx.status).toLowerCase() === 'successful';
  const sameCurrency = String(tx.currency).toUpperCase() === expectedPayment.currency;
  const paidAmount = Number(tx.amount);
  const expectedAmount = Number(expectedPayment.amount);
  const enoughAmount = paidAmount >= expectedAmount;

  expectedPayment.providerReference = String(tx.id || tx.flw_ref || transactionId);
  expectedPayment.providerPayload = tx;
  expectedPayment.verifiedAt = new Date();

  if (successful && sameReference && sameCurrency && enoughAmount) {
    expectedPayment.status = 'SUCCESS';
    expectedPayment.paidAt = expectedPayment.paidAt || new Date();
    await expectedPayment.save();

    const booking = await Booking.findById(expectedPayment.booking);
    if (booking && booking.status !== 'cancelled') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.payment = expectedPayment._id;
      await booking.save();
    }
    return { success: true, payment: expectedPayment, booking };
  }

  expectedPayment.status = successful ? 'FAILED' : String(tx.status).toLowerCase() === 'cancelled' ? 'CANCELLED' : 'FAILED';
  expectedPayment.failureReason = !sameReference
    ? 'Transaction reference mismatch.'
    : !sameCurrency
      ? 'Currency mismatch.'
      : !enoughAmount
        ? 'Amount paid is lower than the booking amount.'
        : tx.processor_response || tx.status || 'Payment was not successful.';
  await expectedPayment.save();

  const booking = await Booking.findById(expectedPayment.booking);
  if (booking && booking.status === 'pending_payment') {
    booking.paymentStatus = 'failed';
    await booking.save();
  }
  return { success: false, payment: expectedPayment, booking };
}

export async function createCheckout(req, res) {
  try {
    if (!requireFlutterwave(res)) return;
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId, user: req.user.id }).populate('agency');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status !== 'pending_payment') return res.status(409).json({ message: 'This booking is no longer awaiting payment.' });
    if (!booking.amount || booking.amount <= 0) return res.status(400).json({ message: 'Booking amount must be greater than zero.' });

    let payment = await Payment.findOne({ booking: booking._id });
    if (payment?.status === 'SUCCESS') return res.json({ paymentStatus: 'SUCCESS', bookingId: booking._id });

    const txRef = payment?.txRef || `SGX-PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    if (!payment) {
      payment = await Payment.create({
        booking: booking._id,
        user: req.user.id,
        amount: booking.amount,
        currency: 'XAF',
        provider: 'flutterwave',
        method: 'checkout',
        txRef,
        status: 'PENDING'
      });
    }

    const publicApi = (process.env.SERVER_PUBLIC_URL || '').replace(/\/$/, '');
    if (!publicApi) return res.status(503).json({ message: 'SERVER_PUBLIC_URL is required for Flutterwave callbacks. Set it in server/.env.' });

    const response = await flwFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: txRef,
        amount: booking.amount,
        currency: 'XAF',
        redirect_url: `${publicApi}/api/payments/flutterwave/callback`,
        customer: {
          email: booking.passenger.email,
          name: booking.passenger.name,
          phonenumber: booking.passenger.phone
        },
        customizations: {
          title: 'SmithGo Express',
          description: `Transport booking ${booking.reference}`
        },
        meta: {
          bookingId: String(booking._id),
          bookingReference: booking.reference,
          agency: booking.agency?.name || ''
        },
        configurations: {
          session_duration: 30,
          max_retry_attempt: 5
        }
      })
    });

    payment.checkoutLink = response?.data?.link;
    payment.status = 'PENDING';
    await payment.save();
    res.json({ checkoutUrl: payment.checkoutLink, txRef: payment.txRef, paymentId: payment._id, bookingId: booking._id });
  } catch (e) {
    console.error('Flutterwave checkout error:', e.body || e.message);
    res.status(e.status || 502).json({ message: e.message || 'Unable to start the payment.' });
  }
}

export async function status(req, res) {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId, user: req.user.id }).populate('booking');
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    res.json({ payment, booking: payment.booking });
  } catch (e) {
    res.status(500).json({ message: 'Unable to load payment status.' });
  }
}

export async function callback(req, res) {
  try {
    if (!requireFlutterwave(res)) return;
    const { status: resultStatus, transaction_id: transactionId, tx_ref: txRef } = req.query;
    const payment = await Payment.findOne({ txRef });
    if (!payment) return res.redirect(`${process.env.CLIENT_URL}/payment-result?status=error&message=Payment%20reference%20not%20found`);

    if (transactionId) {
      await verifyAndApply(transactionId, payment);
    } else if (String(resultStatus).toLowerCase() === 'failed') {
      payment.status = 'FAILED';
      payment.failureReason = 'Flutterwave returned a failed payment.';
      await payment.save();
    }

    const finalStatus = payment.status === 'SUCCESS' ? 'success' : payment.status.toLowerCase();
    return res.redirect(`${process.env.CLIENT_URL}/payment-result?bookingId=${payment.booking}&status=${encodeURIComponent(finalStatus)}`);
  } catch (e) {
    console.error('Flutterwave callback error:', e.body || e.message);
    return res.redirect(`${process.env.CLIENT_URL}/payment-result?status=error&message=We%20could%20not%20verify%20the%20payment`);
  }
}

export async function webhook(req, res) {
  const secret = process.env.FLW_SECRET_HASH;
  if (secret && req.headers['verif-hash'] !== secret) return res.status(401).json({ message: 'Invalid webhook signature.' });

  res.status(200).json({ received: true });

  try {
    const transactionId = req.body?.data?.id;
    const txRef = req.body?.data?.tx_ref;
    if (!transactionId || !txRef) return;
    const payment = await Payment.findOne({ txRef });
    if (!payment || payment.status === 'SUCCESS') return;
    await verifyAndApply(transactionId, payment);
  } catch (e) {
    console.error('Flutterwave webhook processing error:', e.body || e.message);
  }
}

export async function all(req, res) {
  try {
    const payments = await Payment.find().populate('user', 'name email').populate({ path: 'booking', populate: { path: 'agency', select: 'name' } }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) {
    res.status(500).json({ message: 'Unable to load payments.' });
  }
}
