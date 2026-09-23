import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'XAF', uppercase: true },
  provider: { type: String, default: 'flutterwave' },
  method: { type: String, default: 'checkout' },
  txRef: { type: String, required: true, unique: true, index: true },
  providerReference: String,
  checkoutLink: String,
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING',
    index: true
  },
  failureReason: String,
  paidAt: Date,
  verifiedAt: Date,
  providerPayload: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('Payment', schema);
