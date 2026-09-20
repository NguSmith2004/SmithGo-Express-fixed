import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { recordAudit } from '../utils/audit.js';

export async function list(req, res) {
  const search = String(req.query.search || '').trim();
  const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }] } : {};
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
}

export async function update(req, res) {
  const { name, email, phone, role, active, password } = req.body;
  if (req.params.id === req.user.id && active === false) return res.status(400).json({ message: 'You cannot deactivate your own account' });
  const existing = await User.findById(req.params.id).select('role active');
  if (!existing) return res.status(404).json({ message: 'User not found' });
  const previous = { role: existing.role, active: existing.active };
  const updates = { name, email, phone, role, active };
  if (password) updates.password = await bcrypt.hash(password, 12);
  Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  await recordAudit(req, 'user_update', 'User', user._id, previous, { role: user.role, active: user.active });
  res.json(user);
}

export async function remove(req, res) {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account' });
  const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  await recordAudit(req, 'user_deactivate', 'User', user._id, { active: true }, { active: false });
  res.json(user);
}

export async function history(req, res) {
  const items = await Booking.find({ user: req.params.id }).populate('agency schedule').sort({ createdAt: -1 });
  res.json(items);
}
