import express from 'express';
import DispatchReceiveController from '../controllers/dispatchReceiveController.js';

const router = express.Router();
const controller = new DispatchReceiveController();

router.get('/', controller.get);
router.get('/:id', controller.get);
router.post('/', controller.save);
router.put('/:id', controller.save);
router.delete('/:id', controller.delete);

export default router;
