import { Router } from 'express';
import { list } from '../controllers/audit.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();
router.get('/', auth, admin, list);

export default router;
