import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  amount: { type: Number, min: 0, required: true },
  currency: { type: String, default: 'XAF', uppercase: true },
  method: { type: String, enum: ['mobile_money', 'agency_paid', 'admin_pays'], required: true },
  merchantNumber: { type: String, default: '+237 678949296' },
  senderName: String,
  senderPhone: String,
  transactionReference: String,
  amountSent: Number,
  status: { type: String, enum: ['pending', 'submitted', 'paid', 'failed', 'refunded', 'cancelled'], default: 'pending' },
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationNote: String
}, { timestamps: true });

schema.index({ status: 1, createdAt: -1 });
schema.index({ transactionReference: 1 });

export default mongoose.model('Payment', schema);
