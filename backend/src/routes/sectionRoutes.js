import express from 'express';
import SectionController from '../controllers/sectionController.js';

const router = express.Router();
const controller = new SectionController();

router.get('/', controller.getSections);
router.get('/class/:classId', controller.getSectionsByClass);
router.post('/', controller.saveSection);
router.delete('/:id', controller.deleteSection);

export default router;
