import EnquiryRepository from '../repositories/enquiryRepository.js';

class EnquiryService {
  constructor() {
    this.repository = new EnquiryRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Enquirer name is required');
    }
    if (!data.contact || data.contact.trim() === '') {
      throw new Error('Enquirer contact number is required');
    }
    if (!data.date) {
      data.date = new Date().toISOString().slice(0, 10);
    }
    if (!data.status) {
      data.status = 'active';
    }
    if (!data.created_by) {
      data.created_by = 1;
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

export default EnquiryService;
