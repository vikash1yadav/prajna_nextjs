import express from 'express';
import SessionController from '../controllers/sessionController.js';

const router = express.Router();
const controller = new SessionController();

router.get('/', controller.getSessions);
router.get('/previous/:sessionId', controller.getPreviousSession);
router.get('/student/:studentId', controller.getStudentSessions);
router.post('/', controller.saveSession);
router.delete('/:id', controller.deleteSession);

export default router;
