import IncomeService from '../services/incomeService.js';

class IncomeController {
  constructor() {
    this.incomeService = new IncomeService();
  }

  getIncomes = async (req, res, next) => {
    try {
      const searchTerm = req.query.search || '';
      const data = await this.incomeService.getAll(searchTerm);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getIncomeById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.incomeService.getById(parseInt(id));
      if (!data) {
        return res.status(404).json({ success: false, message: 'Income record not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveIncome = async (req, res, next) => {
    try {
      const { id, name, invoice_no, income_head_id, date, amount, note, documents } = req.body;
      let data;
      if (id) {
        await this.incomeService.update(parseInt(id), { name, invoice_no, income_head_id, date, amount, note, documents });
        data = { id: parseInt(id) };
      } else {
        data = await this.incomeService.create({ name, invoice_no, income_head_id, date, amount, note, documents });
      }
      return res.status(200).json({ success: true, message: 'Income saved successfully', data });
    } catch (error) {
      next(error);
    }
  };

  deleteIncome = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.incomeService.delete(parseInt(id));
      return res.status(200).json({ success: true, message: 'Income record deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Income Head Controller Methods ---

  getIncomeHeads = async (req, res, next) => {
    try {
      const data = await this.incomeService.getAllHeads();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveIncomeHead = async (req, res, next) => {
    try {
      const { id, income_category, description } = req.body;
      let data;
      if (id) {
        await this.incomeService.updateHead(parseInt(id), { income_category, description });
        data = { id: parseInt(id) };
      } else {
        data = await this.incomeService.createHead({ income_category, description });
      }
      return res.status(200).json({ success: true, message: 'Income Head saved successfully', data });
    } catch (error) {
      next(error);
    }
  };

  deleteIncomeHead = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.incomeService.deleteHead(parseInt(id));
      return res.status(200).json({ success: true, message: 'Income Head deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default IncomeController;
