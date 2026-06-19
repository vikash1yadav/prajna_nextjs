import express from 'express';
import LessonPlanController from '../controllers/lessonPlanController.js';

const router = express.Router();
const controller = new LessonPlanController();

router.get('/lessons', controller.getLessons);
router.post('/lessons', controller.saveLesson);
router.delete('/lessons/:id', controller.deleteLesson);

router.get('/topics', controller.getTopics);
router.post('/topics', controller.saveTopic);
router.delete('/topics/:id', controller.deleteTopic);

router.get('/syllabus-status', controller.getSyllabusStatus);

router.get('/syllabus-logs', controller.getSyllabusLogs);
router.post('/syllabus-logs', controller.saveSyllabusLog);
router.delete('/syllabus-logs/:id', controller.deleteSyllabusLog);

router.post('/copy-lessons', controller.copyOldLessons);

export default router;
