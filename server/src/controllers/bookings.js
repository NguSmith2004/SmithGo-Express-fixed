import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import Booking from '../models/Booking.js';
import Schedule from '../models/Schedule.js';
import Payment from '../models/Payment.js';
import QRCode from 'qrcode';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export async function create(req, res) {
	try {
		const { schedule: scheduleId, passenger, seats = 1, seatType = 'Standard', paymentMode = 'customer_pays' } = req.body;
		const adminSponsored = req.user.role === 'admin' && ['agency_paid', 'admin_pays'].includes(paymentMode);
		const seatCount = Number(seats);
		if (!scheduleId || !passenger?.name || !passenger?.phone || !passenger?.email) {
			return res.status(400).json({ message: 'Schedule and complete passenger details are required' });
		}
		if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 8) {
			return res.status(400).json({ message: 'Seats must be a whole number between 1 and 8' });
		}

		const schedule = await Schedule.findOneAndUpdate(
			{ _id: scheduleId, active: true, availableSeats: { $gte: seatCount } },
			{ $inc: { availableSeats: -seatCount } },
			{ new: true }
		);
		if (!schedule) return res.status(409).json({ message: 'This departure is sold out or no longer available' });

		try {
			const booking = await Booking.create({
				reference: `SGX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
				user: req.user.id,
				agency: schedule.agency,
				schedule: schedule._id,
				trip: { from: schedule.from, to: schedule.to, departureDate: schedule.departureDate, departureTime: schedule.departureTime, seatType },
				passenger,
				seats: seatCount,
				amount: schedule.price * seatCount,
				currency: schedule.currency,
				paymentMethod: adminSponsored ? paymentMode : 'mobile_money',
				paymentRequired: !adminSponsored,
				paymentStatus: adminSponsored ? 'paid' : 'pending',
				status: adminSponsored ? 'confirmed' : 'payment_pending'
			});
			if (adminSponsored) {
				await Payment.create({ user: req.user.id, booking: booking._id, agency: schedule.agency, amount: booking.amount, currency: booking.currency, method: paymentMode, status: 'paid', verifiedAt: new Date(), verifiedBy: req.user.id, verificationNote: paymentMode === 'agency_paid' ? 'Paid by agency' : 'Paid by administrator' });
			}
			const admins = await User.find({ role: 'admin', active: { $ne: false } }).select('_id');
			await Notification.insertMany(admins.map(admin => ({ user: admin._id, type: 'booking', title: 'New booking', message: `${booking.reference} requires payment verification`, booking: booking._id })));
			await booking.populate('agency schedule');
			return res.status(201).json(booking);
		} catch (error) {
			await Schedule.updateOne({ _id: schedule._id }, { $inc: { availableSeats: seatCount } });
			throw error;
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
}

export async function mine(req, res) {
	res.json(await Booking.find({ user: req.user.id }).populate('agency schedule').sort({ createdAt: -1 }));
}

export async function all(req, res) {
	res.json(await Booking.find().populate('agency user schedule', 'name email from to departureDate departureTime').sort({ createdAt: -1 }));
}

export async function cancel(req, res) {
	const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
	if (!booking) return res.status(404).json({ message: 'Booking not found' });
	if (booking.status === 'cancelled') return res.json(booking);
	if (booking.status === 'completed') return res.status(409).json({ message: 'Completed bookings cannot be cancelled' });

	if (booking.schedule) await Schedule.updateOne({ _id: booking.schedule }, { $inc: { availableSeats: booking.seats || 1 } });
	if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
	else if (booking.paymentStatus !== 'refunded') booking.paymentStatus = 'cancelled';
	booking.status = 'cancelled';
	await booking.save();
	res.json(booking);
}

export async function ticket(req, res) {
	const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id }).populate('agency schedule');
	if (!booking) return res.status(404).end();
	const sponsored = ['agency_paid', 'admin_pays'].includes(booking.paymentMethod);
	const paymentVerified = sponsored || booking.paymentStatus === 'paid';
	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', `attachment; filename=SmithGo-Ticket-${booking.reference}.pdf`);
	const document = new PDFDocument({ margin: 50 });
	document.pipe(res);
	const qr = await QRCode.toDataURL(JSON.stringify({ reference: booking.reference, ticketId: booking.ticketId, status: booking.status, paymentStatus: booking.paymentStatus }));
	document.fillColor('#121719').rect(50, 50, 512, 84).fill();
	document.fillColor('#e9ff55').fontSize(24).text('SMITHGO EXPRESS', 72, 74);
	document.fillColor('#ffffff').fontSize(10).text(paymentVerified ? 'ONLINE BOOKING TICKET' : 'RESERVATION TICKET - PAYMENT PENDING', 72, 105);
	document.fillColor('#101418').fontSize(18).text(booking.reference, 72, 160).moveDown();
	document.image(qr, 450, 150, { width: 90, height: 90 });
	document.fontSize(12)
		.text(`Ticket ID: ${booking.ticketId}`)
		.text(`Agency: ${booking.agency.name}`)
		.text(`Passenger: ${booking.passenger.name}`)
		.text(`Email: ${booking.passenger.email}`)
		.text(`Phone: ${booking.passenger.phone}`)
		.text(`Route: ${booking.trip.from} -> ${booking.trip.to}`)
		.text(`Date: ${booking.trip.departureDate}`)
		.text(`Time: ${booking.trip.departureTime}`)
		.text(`Seats: ${booking.seats || 1}`)
		.text(`Amount: ${booking.amount} ${booking.currency}`)
		.text(`Payment: ${paymentVerified ? 'PAID' : 'PENDING VERIFICATION'}`)
		.text(`Status: ${paymentVerified ? booking.status : 'PAYMENT PENDING - NOT CONFIRMED'}`)
		.text(`Generated: ${new Date().toLocaleString()}`)
		.moveDown(2);
	document.fontSize(9).text(paymentVerified ? 'Please arrive at the agency before departure and present this ticket.' : 'This reservation ticket is not proof of payment or a confirmed boarding ticket. Complete payment and wait for verification before travel.');
	document.end();
}
