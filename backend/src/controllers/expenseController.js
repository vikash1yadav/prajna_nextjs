import ExpenseService from '../services/expenseService.js';

class ExpenseController {
  constructor() {
    this.expenseService = new ExpenseService();
  }

  getExpenses = async (req, res, next) => {
    try {
      const searchTerm = req.query.search || '';
      const data = await this.expenseService.getAll(searchTerm);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getExpenseById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.expenseService.getById(parseInt(id));
      if (!data) {
        return res.status(404).json({ success: false, message: 'Expense record not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExpense = async (req, res, next) => {
    try {
      const { id, name, invoice_no, exp_head_id, date, amount, note, documents } = req.body;
      let data;
      if (id) {
        await this.expenseService.update(parseInt(id), { name, invoice_no, exp_head_id, date, amount, note, documents });
        data = { id: parseInt(id) };
      } else {
        data = await this.expenseService.create({ name, invoice_no, exp_head_id, date, amount, note, documents });
      }
      return res.status(200).json({ success: true, message: 'Expense saved successfully', data });
    } catch (error) {
      next(error);
    }
  };

  deleteExpense = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.expenseService.delete(parseInt(id));
      return res.status(200).json({ success: true, message: 'Expense record deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Expense Head Controller Methods ---

  getExpenseHeads = async (req, res, next) => {
    try {
      const data = await this.expenseService.getAllHeads();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExpenseHead = async (req, res, next) => {
    try {
      const { id, exp_category, description } = req.body;
      let data;
      if (id) {
        await this.expenseService.updateHead(parseInt(id), { exp_category, description });
        data = { id: parseInt(id) };
      } else {
        data = await this.expenseService.createHead({ exp_category, description });
      }
      return res.status(200).json({ success: true, message: 'Expense Head saved successfully', data });
    } catch (error) {
      next(error);
    }
  };

  deleteExpenseHead = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.expenseService.deleteHead(parseInt(id));
      return res.status(200).json({ success: true, message: 'Expense Head deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default ExpenseController;
