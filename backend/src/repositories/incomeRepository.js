import Income from '../models/income.js';
import IncomeHead from '../models/incomeHead.js';
import { Op } from 'sequelize';

class IncomeRepository {
  constructor() {
    // Establish association dynamically if not already established
    if (!Income.associations.IncomeHead) {
      Income.belongsTo(IncomeHead, { foreignKey: 'income_head_id' });
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

    return await Income.findAll({
      where: whereClause,
      include: [
        {
          model: IncomeHead,
          required: false,
          where: { is_deleted: 'no' }
        }
      ],
      order: [['id', 'DESC']]
    });
  }

  async getById(id) {
    return await Income.findOne({
      where: { id, is_deleted: 'no' },
      include: [{ model: IncomeHead, required: false }]
    });
  }

  async create(data) {
    return await Income.create(data);
  }

  async update(id, data) {
    return await Income.update(data, {
      where: { id }
    });
  }

  async delete(id) {
    // Physical delete matching legacy PHP behaviour
    return await Income.destroy({
      where: { id }
    });
  }

  // --- Income Head Methods ---

  async getAllHeads() {
    return await IncomeHead.findAll({
      where: { is_deleted: 'no' },
      order: [['id', 'ASC']]
    });
  }

  async getHeadById(id) {
    return await IncomeHead.findOne({
      where: { id, is_deleted: 'no' }
    });
  }

  async createHead(data) {
    return await IncomeHead.create(data);
  }

  async updateHead(id, data) {
    return await IncomeHead.update(data, {
      where: { id }
    });
  }

  async deleteHead(id) {
    return await IncomeHead.destroy({
      where: { id }
    });
  }
}

export default IncomeRepository;
