import express from 'express';
import ClassController from '../controllers/classController.js';

const router = express.Router();
const controller = new ClassController();

router.get('/', controller.getClasses);
router.get('/teachers', controller.getClassTeachers);
router.get('/:classId/sections', controller.getClassSections);
router.post('/', controller.saveClass);
router.delete('/:id', controller.deleteClass);

export default router;
