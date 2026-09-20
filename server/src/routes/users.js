import { Router } from 'express';
import { list, update, remove, history } from '../controllers/users.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();
router.use(auth, admin);
router.get('/', list);
router.get('/:id/bookings', history);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
