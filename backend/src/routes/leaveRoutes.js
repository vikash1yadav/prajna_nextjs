import express from 'express';
import LeaveController from '../controllers/leaveController.js';

const router = express.Router();
const controller = new LeaveController();

router.get('/', controller.getLeaves);
router.post('/', controller.saveLeave);
router.put('/:id/status', controller.updateStatus);
router.delete('/:id', controller.deleteLeave);

export default router;
