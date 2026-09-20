import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  departureDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  departureTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  durationMinutes: { type: Number, min: 1, default: 180 },
  price: { type: Number, min: 0, required: true },
  currency: { type: String, default: 'XAF', uppercase: true, trim: true },
  capacity: { type: Number, min: 1, required: true },
  availableSeats: { type: Number, min: 0, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

schema.index({ agency: 1, departureDate: 1, active: 1 });
schema.index({ from: 1, to: 1, departureDate: 1, active: 1 });

export default mongoose.model('Schedule', schema);
