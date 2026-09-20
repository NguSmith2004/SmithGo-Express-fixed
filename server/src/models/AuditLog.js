import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: String,
  previous: mongoose.Schema.Types.Mixed,
  next: mongoose.Schema.Types.Mixed,
  ip: String
}, { timestamps: true });

schema.index({ createdAt: -1 });
schema.index({ actor: 1, createdAt: -1 });

export default mongoose.model('AuditLog', schema);
