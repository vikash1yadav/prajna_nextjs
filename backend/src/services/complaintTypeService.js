import ComplaintTypeRepository from '../repositories/complaintTypeRepository.js';

class ComplaintTypeService {
  constructor() {
    this.repository = new ComplaintTypeRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.complaint_type || data.complaint_type.trim() === '') {
      throw new Error('Complaint type is required');
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

export default ComplaintTypeService;
