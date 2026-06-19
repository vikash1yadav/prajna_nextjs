import IncomeRepository from '../repositories/incomeRepository.js';

class IncomeService {
  constructor() {
    this.incomeRepository = new IncomeRepository();
  }

  async getAll(searchTerm) {
    return await this.incomeRepository.getAll(searchTerm);
  }

  async getById(id) {
    if (!id) throw new Error('Income ID is required');
    return await this.incomeRepository.getById(id);
  }

  async create(data) {
    if (!data.name) throw new Error('Income Name/Title is required');
    if (!data.amount) throw new Error('Income Amount is required');
    if (!data.income_head_id) throw new Error('Income Head is required');
    if (!data.date) throw new Error('Income Date is required');

    return await this.incomeRepository.create(data);
  }

  async update(id, data) {
    if (!id) throw new Error('Income ID is required');
    return await this.incomeRepository.update(id, data);
  }

  async delete(id) {
    if (!id) throw new Error('Income ID is required');
    return await this.incomeRepository.delete(id);
  }

  // --- Income Head Methods ---

  async getAllHeads() {
    return await this.incomeRepository.getAllHeads();
  }

  async createHead(data) {
    if (!data.income_category) throw new Error('Income category/head title is required');
    return await this.incomeRepository.createHead(data);
  }

  async updateHead(id, data) {
    if (!id) throw new Error('Income Head ID is required');
    return await this.incomeRepository.updateHead(id, data);
  }

  async deleteHead(id) {
    if (!id) throw new Error('Income Head ID is required');
    return await this.incomeRepository.deleteHead(id);
  }
}

export default IncomeService;
