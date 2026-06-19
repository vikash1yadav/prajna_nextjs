import VisitorRepository from '../repositories/visitorRepository.js';

class VisitorService {
  constructor() {
    this.repository = new VisitorRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Visitor name is required');
    }
    if (!data.contact || data.contact.trim() === '') {
      throw new Error('Visitor contact is required');
    }
    if (!data.purpose || data.purpose.trim() === '') {
      throw new Error('Visitor purpose is required');
    }
    if (!data.date) {
      data.date = new Date().toISOString().slice(0, 10);
    }
    return await this.repository.add(data);
  }

  async remove(id) {
    if (!id) {
      throw new Error('ID is required for deletion');
    }
    return await this.repository.remove(id);
  }
}

export default VisitorService;
