import express from 'express';
import ExpenseController from '../controllers/expenseController.js';

const router = express.Router();
const controller = new ExpenseController();

// Expense Category / Head Routes
router.get('/heads', controller.getExpenseHeads);
router.post('/heads', controller.saveExpenseHead);
router.delete('/heads/:id', controller.deleteExpenseHead);

// Expense Core Routes
router.get('/', controller.getExpenses);
router.get('/:id', controller.getExpenseById);
router.post('/', controller.saveExpense);
router.delete('/:id', controller.deleteExpense);

export default router;
