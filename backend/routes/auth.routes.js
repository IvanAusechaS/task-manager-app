import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', ...AuthController.signup);
router.post('/login', ...AuthController.login);
router.post('/logout', ...AuthController.logout);
router.post('/recover-password', ...AuthController.recoverPassword);

export default router;