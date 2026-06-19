import ExpenseRepository from '../repositories/expenseRepository.js';

class ExpenseService {
  constructor() {
    this.expenseRepository = new ExpenseRepository();
  }

  async getAll(searchTerm) {
    return await this.expenseRepository.getAll(searchTerm);
  }

  async getById(id) {
    if (!id) throw new Error('Expense ID is required');
    return await this.expenseRepository.getById(id);
  }

  async create(data) {
    if (!data.name) throw new Error('Expense Name/Title is required');
    if (!data.amount) throw new Error('Expense Amount is required');
    if (!data.exp_head_id) throw new Error('Expense Head is required');
    if (!data.date) throw new Error('Expense Date is required');

    return await this.expenseRepository.create(data);
  }

  async update(id, data) {
    if (!id) throw new Error('Expense ID is required');
    return await this.expenseRepository.update(id, data);
  }

  async delete(id) {
    if (!id) throw new Error('Expense ID is required');
    return await this.expenseRepository.delete(id);
  }

  // --- Expense Head Methods ---

  async getAllHeads() {
    return await this.expenseRepository.getAllHeads();
  }

  async createHead(data) {
    if (!data.exp_category) throw new Error('Expense category/head title is required');
    return await this.expenseRepository.createHead(data);
  }

  async updateHead(id, data) {
    if (!id) throw new Error('Expense Head ID is required');
    return await this.expenseRepository.updateHead(id, data);
  }

  async deleteHead(id) {
    if (!id) throw new Error('Expense Head ID is required');
    return await this.expenseRepository.deleteHead(id);
  }
}

export default ExpenseService;
