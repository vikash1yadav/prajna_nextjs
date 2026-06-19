import ComplaintRepository from '../repositories/complaintRepository.js';

class ComplaintService {
  constructor() {
    this.repository = new ComplaintRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Complainant name is required');
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

export default ComplaintService;
