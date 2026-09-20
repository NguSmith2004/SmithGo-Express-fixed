import { Router } from 'express';
import { mine, unread, markRead } from '../controllers/notifications.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.get('/', mine);
router.get('/unread', unread);
router.patch('/:id/read', markRead);

export default router;
