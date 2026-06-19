import express from 'express';
import EnquiryController from '../controllers/enquiryController.js';

const router = express.Router();
const controller = new EnquiryController();

router.get('/', controller.get);
router.get('/:id', controller.get);
router.post('/', controller.save);
router.put('/:id', controller.save);
router.delete('/:id', controller.delete);

export default router;
