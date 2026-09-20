import { Router } from 'express';
import { list, all, create, update, remove } from '../controllers/schedules.js';
import { auth, admin, adminOrManager } from '../middleware/auth.js';

const router = Router();
router.get('/', list);
router.get('/manage', auth, adminOrManager, all);
router.post('/', auth, adminOrManager, create);
router.put('/:id', auth, adminOrManager, update);
router.delete('/:id', auth, adminOrManager, remove);

export default router;
