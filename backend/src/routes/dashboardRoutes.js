import express from 'express';
import DashboardController from '../controllers/dashboardController.js';

const router = express.Router();
const controller = new DashboardController();

router.get('/stats', controller.getDashboardStats);

export default router;
