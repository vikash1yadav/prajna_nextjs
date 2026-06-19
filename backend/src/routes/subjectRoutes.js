import express from 'express';
import SubjectController from '../controllers/subjectController.js';

const router = express.Router();
const controller = new SubjectController();

router.get('/', controller.getSubjects);
router.post('/', controller.saveSubject);
router.delete('/:id', controller.deleteSubject);

export default router;
