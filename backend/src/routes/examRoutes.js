import express from 'express';
import ExamController from '../controllers/examController.js';

const router = express.Router();
const controller = new ExamController();

// --- Basic Exams & Schedules (Legacy fallback support) ---
router.get('/', controller.getExams);
router.post('/', controller.saveExam);
router.delete('/:id', controller.deleteExam);
router.post('/schedules', controller.saveExamSchedule);
router.get('/schedules', controller.getExamSchedules);
router.get('/class-section', controller.getExamByClassAndSection);

// --- Exam Groups ---
router.get('/groups', controller.getExamGroups);
router.post('/groups', controller.saveExamGroup);
router.delete('/groups/:id', controller.deleteExamGroup);

// --- Grades & Divisions ---
router.get('/grades', controller.getGrades);
router.post('/grades', controller.saveGrade);
router.delete('/grades/:id', controller.deleteGrade);

router.get('/divisions', controller.getDivisions);
router.post('/divisions', controller.saveDivision);
router.delete('/divisions/:id', controller.deleteDivision);

// --- Admit Card & Marksheet Templates ---
router.get('/templates/admit-card', controller.getTemplateAdmitcards);
router.post('/templates/admit-card', controller.saveTemplateAdmitcard);
router.delete('/templates/admit-card/:id', controller.deleteTemplateAdmitcard);

router.get('/templates/marksheet', controller.getTemplateMarksheets);
router.post('/templates/marksheet', controller.saveTemplateMarksheet);
router.delete('/templates/marksheet/:id', controller.deleteTemplateMarksheet);

// --- Group Connected Exams ---
router.get('/groups/:groupId/exams', controller.getExamsByGroupId);
router.post('/groups/exams', controller.saveExamGroupExam);
router.delete('/groups/exams/:id', controller.deleteExamGroupExam);

// --- Subject & Student Mappings per Connected Exam ---
router.get('/exams/:examGroupExamId/subjects', controller.getExamSubjects);
router.post('/exams/:examGroupExamId/subjects', controller.saveExamSubjects);

router.get('/groups/:groupId/students', controller.getExamGroupStudents);
router.post('/groups/:groupId/students', controller.saveExamGroupStudents);

router.get('/exams/:examGroupExamId/eligible-students', controller.getEligibleStudentsForExam);
router.post('/exams/:examGroupExamId/students', controller.assignStudentsToExam);

// --- Results & Marks entry ---
router.get('/subjects/:examSubjectId/results', controller.getExamSubjectResult);
router.post('/results', controller.saveExamResults);
router.post('/results/rank', controller.updateRanks);

// --- Printing Generation ---
router.get('/exams/:examGroupExamId/students', controller.getExamStudents);
router.get('/exams/:examGroupExamId/students/:studentId/results', controller.getStudentExamResults);

export default router;
