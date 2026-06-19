import { Router } from 'express';
import AuthController from '../controllers/authController.js';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.get('/me', controller.me);
router.post('/logout', controller.logout);

export default router;
