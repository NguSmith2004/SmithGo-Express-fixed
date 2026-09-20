import { Router } from 'express';
import { submit, mine, all, verify, getForBooking } from '../controllers/payments.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();
router.get('/mine', auth, mine);
router.get('/booking/:bookingId', auth, getForBooking);
router.post('/booking/:bookingId/submit', auth, submit);
router.get('/', auth, admin, all);
router.patch('/:id/verify', auth, admin, verify);

export default router;
