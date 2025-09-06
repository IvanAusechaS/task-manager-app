import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import passport from 'passport';

const router = Router();

router.post('/signup', ...AuthController.signup);
router.post('/login', ...AuthController.login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: true
    }),
    AuthController.googleCallback
);
router.post('/logout', ...AuthController.logout);
router.post('/recover-password', ...AuthController.recoverPassword);
router.post('/reset-password', ...AuthController.resetPassword);

export default router;