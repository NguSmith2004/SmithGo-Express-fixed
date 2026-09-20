import Notification from '../models/Notification.js';

export async function mine(req, res) {
  res.json(await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50));
}

export async function unread(req, res) {
  res.json({ count: await Notification.countDocuments({ user: req.user.id, read: false }) });
}

export async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
}
