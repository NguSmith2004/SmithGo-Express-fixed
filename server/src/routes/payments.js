import { Router } from 'express';
import { createCheckout, status, callback, webhook, all } from '../controllers/payments.js';
import { auth } from '../middleware/auth.js';

const r = Router();
r.post('/flutterwave/webhook', webhook);
r.get('/flutterwave/callback', callback);
r.post('/create-checkout', auth, createCheckout);
r.get('/status/:bookingId', auth, status);
r.get('/all', auth, (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required.' }), all);
export default r;
