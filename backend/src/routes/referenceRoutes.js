import express from 'express';
import ReferenceController from '../controllers/referenceController.js';

const router = express.Router();
const controller = new ReferenceController();

router.get('/', controller.get);
router.get('/:id', controller.get);
router.post('/', controller.save);
router.put('/:id', controller.save);
router.delete('/:id', controller.delete);

export default router;
