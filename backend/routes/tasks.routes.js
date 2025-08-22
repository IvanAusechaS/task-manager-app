import { Router } from 'express';
import { createTask, getTasks } from '../controllers/tasks.controller.js';

const router = Router();

// Note: In a real app, these routes would be protected by an authentication middleware.
router.post('/', createTask);
router.get('/', getTasks);

export default router;