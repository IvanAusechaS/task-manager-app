import { Router } from 'express';
// We will import controller functions here later
// import { createTask, getTasks } from '../controllers/tasks.controller.js';

const router = Router();

router.post('/', /* createTask */);
router.get('/', /* getTasks */);

export default router;