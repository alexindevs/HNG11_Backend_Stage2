import express from 'express';
import AuthController from '../controllers/auth.controller';
import AuthService from '../services/auth.service';

const router = express.Router();
const authService = new AuthService();
const authController = new AuthController(authService);

// Route definitions
router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;