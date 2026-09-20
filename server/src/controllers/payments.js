import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { recordAudit } from '../utils/audit.js';

const MERCHANT_NUMBER = '+237 678949296';

export async function submit(req, res) {
  const { senderName, senderPhone, transactionReference, amountSent } = req.body;
  if (!senderName || !senderPhone || !transactionReference || amountSent === undefined) {
    return res.status(400).json({ message: 'Sender name, sender phone, transaction reference and amount sent are required' });
  }

  const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user.id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (!booking.paymentRequired) return res.status(409).json({ message: 'This booking is already sponsored and does not require payment' });
  if (booking.status === 'cancelled') return res.status(409).json({ message: 'Cancelled bookings cannot receive payments' });
  if (Number(amountSent) !== booking.amount) return res.status(400).json({ message: `Amount sent must be exactly ${booking.amount} ${booking.currency}` });

  const payment = await Payment.findOneAndUpdate(
    { booking: booking._id },
    { user: req.user.id, booking: booking._id, agency: booking.agency, amount: booking.amount, currency: booking.currency, method: 'mobile_money', merchantNumber: MERCHANT_NUMBER, senderName, senderPhone, transactionReference, amountSent: Number(amountSent), status: 'submitted', submittedAt: new Date() },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  booking.paymentMethod = 'mobile_money';
  booking.paymentStatus = 'submitted';
  booking.status = 'payment_pending';
  await booking.save();
	const admins = await User.find({ role: 'admin', active: { $ne: false } }).select('_id');
	await Notification.insertMany(admins.map(admin => ({ user: admin._id, type: 'payment', title: 'Payment awaiting verification', message: `${booking.reference} payment requires review`, booking: booking._id, payment: payment._id })));
  res.status(201).json(payment);
}

export async function mine(req, res) {
  res.json(await Payment.find({ user: req.user.id }).populate('booking agency').sort({ createdAt: -1 }));
}

export async function all(req, res) {
  res.json(await Payment.find().populate('user booking agency verifiedBy', 'name email reference').sort({ createdAt: -1 }));
}

export async function verify(req, res) {
  const { status, note } = req.body;
  if (!['paid', 'failed', 'refunded', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid payment verification status' });
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  const previousStatus = payment.status;
  const booking = await Booking.findById(payment.booking);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  payment.status = status;
  payment.verificationNote = note || '';
  payment.verifiedAt = new Date();
  payment.verifiedBy = req.user.id;
  await payment.save();

  booking.paymentStatus = status;
  booking.status = status === 'paid' ? 'confirmed' : status === 'refunded' ? 'refunded' : 'payment_pending';
  await booking.save();
  await recordAudit(req, `payment_${status}`, 'Payment', payment._id, { status: previousStatus }, { status, booking: booking._id });
  res.json({ payment, booking });
}

export async function getForBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user.id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const payment = await Payment.findOne({ booking: booking._id });
  res.json(payment || { status: booking.paymentStatus, method: booking.paymentMethod, amount: booking.amount, currency: booking.currency, merchantNumber: MERCHANT_NUMBER });
}
