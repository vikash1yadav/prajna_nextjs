import express from 'express';
import StudentController from '../controllers/studentController.js';

const router = express.Router();
const controller = new StudentController();

router.get('/multi-class', controller.getMultiClassStudents);
router.put('/:id/multi-class', controller.updateMultiClassStudent);

router.get('/', controller.getStudents);
router.delete('/bulk-delete', controller.bulkDeleteStudents);
router.get('/:id', controller.getStudentById);
router.post('/', controller.saveStudent);
router.put('/:id', controller.updateStudent);
router.delete('/:id', controller.deleteStudent);

export default router;
