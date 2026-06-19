import express from 'express';
import DisableReasonController from '../controllers/disableReasonController.js';

const router = express.Router();
const controller = new DisableReasonController();

router.get('/', controller.getReasons);
router.get('/:id', controller.getReasons);
router.post('/', controller.saveReason);
router.put('/:id', controller.saveReason);
router.delete('/:id', controller.deleteReason);

export default router;
