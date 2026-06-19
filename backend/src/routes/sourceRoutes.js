import express from 'express';
import SourceController from '../controllers/sourceController.js';

const router = express.Router();
const controller = new SourceController();

router.get('/', controller.get);
router.get('/:id', controller.get);
router.post('/', controller.save);
router.put('/:id', controller.save);
router.delete('/:id', controller.delete);

export default router;
