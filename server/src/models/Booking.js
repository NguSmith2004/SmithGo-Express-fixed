import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	reference: { type: String, unique: true },
	ticketId: { type: String, unique: true, default: () => `TKT-${new mongoose.Types.ObjectId().toString().toUpperCase()}` },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
	schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
	trip: { from: String, to: String, departureDate: String, departureTime: String, seatType: String },
	passenger: { name: String, phone: String, email: String, idNumber: String },
	seats: { type: Number, min: 1, default: 1 },
	amount: { type: Number, min: 0, required: true },
	currency: { type: String, default: 'XAF', uppercase: true },
	paymentMethod: { type: String, enum: ['mobile_money', 'agency_paid', 'admin_pays'], default: 'mobile_money' },
	paymentRequired: { type: Boolean, default: true },
	paymentStatus: { type: String, enum: ['unpaid', 'pending', 'submitted', 'paid', 'failed', 'refunded', 'cancelled'], default: 'pending' },
	status: { type: String, enum: ['payment_pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded', 'expired'], default: 'payment_pending' }
}, { timestamps: true });

schema.index({ user: 1, createdAt: -1 });
schema.index({ schedule: 1, status: 1 });

export default mongoose.model('Booking',schema);
