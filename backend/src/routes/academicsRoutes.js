import express from 'express';
import AcademicsController from '../controllers/academicsController.js';

const router = express.Router();
const controller = new AcademicsController();

router.get('/subject-groups', controller.getSubjectGroups);
router.post('/subject-groups', controller.saveSubjectGroup);
router.delete('/subject-groups/:id', controller.deleteSubjectGroup);

router.get('/class-teachers', controller.getClassTeachers);
router.post('/class-teachers', controller.assignClassTeachers);

router.get('/timetable', controller.getTimetable);
router.post('/timetable', controller.saveTimetable);
router.get('/timetable/teacher/:staff_id', controller.getTeacherTimetable);

router.post('/promote-students', controller.promoteStudents);

export default router;
