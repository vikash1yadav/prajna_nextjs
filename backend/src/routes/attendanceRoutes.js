import express from 'express';
import AttendanceController from '../controllers/attendanceController.js';

const router = express.Router();
const controller = new AttendanceController();

router.get('/types', controller.getTypes);
router.get('/search', controller.searchAttendance);
router.get('/monthly', controller.getMonthlyAttendance);
router.get('/summary', controller.getTodayAttendanceSummary);
router.post('/', controller.saveAttendance);
router.post('/save', controller.saveAttendance);

export default router;
