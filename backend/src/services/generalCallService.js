import GeneralCallRepository from '../repositories/generalCallRepository.js';

class GeneralCallService {
  constructor() {
    this.repository = new GeneralCallRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.call_type || data.call_type.trim() === '') {
      throw new Error('Call type is required');
    }
    if (!data.contact || data.contact.trim() === '') {
      throw new Error('Contact number is required');
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

export default GeneralCallService;
