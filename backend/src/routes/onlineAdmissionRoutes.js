import { Router } from 'express';
import OnlineAdmissionController from '../controllers/onlineAdmissionController.js';

const router = Router();
const onlineAdmissionController = new OnlineAdmissionController();

router.get('/', onlineAdmissionController.getAdmissions);
router.put('/:id/enroll', onlineAdmissionController.enrollAdmission);
router.delete('/:id', onlineAdmissionController.deleteAdmission);

export default router;
