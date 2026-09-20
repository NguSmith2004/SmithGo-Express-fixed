import AuditLog from '../models/AuditLog.js';

export async function list(req, res) {
  const logs = await AuditLog.find().populate('actor', 'name email role').sort({ createdAt: -1 }).limit(200);
  res.json(logs);
}
