import express from 'express';
import VisitorPurposeController from '../controllers/visitorPurposeController.js';

const router = express.Router();
const controller = new VisitorPurposeController();

router.get('/', controller.get);
router.get('/:id', controller.get);
router.post('/', controller.save);
router.put('/:id', controller.save);
router.delete('/:id', controller.delete);

export default router;
