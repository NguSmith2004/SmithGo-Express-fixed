import mongoose from 'mongoose';
const schema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	phone: String,
	password: { type: String, required: true },
	role: { type: String, enum: ['customer', 'admin', 'agency_manager'], default: 'customer' },
	active: { type: Boolean, default: true },
	termsAcceptedAt: Date,
	termsVersion: String,
	privacyNoticeVersion: String
}, { timestamps: true });
export default mongoose.model('User',schema);
