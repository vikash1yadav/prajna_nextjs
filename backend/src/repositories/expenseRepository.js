import Expense from '../models/expense.js';
import ExpenseHead from '../models/expenseHead.js';
import { Op } from 'sequelize';

class ExpenseRepository {
  constructor() {
    // Establish association dynamically
    if (!Expense.associations.ExpenseHead) {
      Expense.belongsTo(ExpenseHead, { foreignKey: 'exp_head_id' });
    }
  }

  async getAll(searchTerm = '') {
    const whereClause = {
      is_deleted: 'no'
    };

    if (searchTerm) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { invoice_no: { [Op.like]: `%${searchTerm}%` } },
        { note: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    return await Expense.findAll({
      where: whereClause,
      include: [
        {
          model: ExpenseHead,
          required: false,
          where: { is_deleted: 'no' }
        }
      ],
      order: [['id', 'DESC']]
    });
  }

  async getById(id) {
    return await Expense.findOne({
      where: { id, is_deleted: 'no' },
      include: [{ model: ExpenseHead, required: false }]
    });
  }

  async create(data) {
    return await Expense.create(data);
  }

  async update(id, data) {
    return await Expense.update(data, {
      where: { id }
    });
  }

  async delete(id) {
    return await Expense.destroy({
      where: { id }
    });
  }

  // --- Expense Head Methods ---

  async getAllHeads() {
    return await ExpenseHead.findAll({
      where: { is_deleted: 'no' },
      order: [['id', 'ASC']]
    });
  }

  async getHeadById(id) {
    return await ExpenseHead.findOne({
      where: { id, is_deleted: 'no' }
    });
  }

  async createHead(data) {
    return await ExpenseHead.create(data);
  }

  async updateHead(id, data) {
    return await ExpenseHead.update(data, {
      where: { id }
    });
  }

  async deleteHead(id) {
    return await ExpenseHead.destroy({
      where: { id }
    });
  }
}

export default ExpenseRepository;
