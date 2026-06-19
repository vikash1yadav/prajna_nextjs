import express from 'express';
import IncomeController from '../controllers/incomeController.js';

const router = express.Router();
const controller = new IncomeController();

// Income Category / Head Routes
router.get('/heads', controller.getIncomeHeads);
router.post('/heads', controller.saveIncomeHead);
router.delete('/heads/:id', controller.deleteIncomeHead);

// Income Core Routes
router.get('/', controller.getIncomes);
router.get('/:id', controller.getIncomeById);
router.post('/', controller.saveIncome);
router.delete('/:id', controller.deleteIncome);

export default router;
