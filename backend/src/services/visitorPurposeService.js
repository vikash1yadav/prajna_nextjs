import VisitorPurposeRepository from '../repositories/visitorPurposeRepository.js';

class VisitorPurposeService {
  constructor() {
    this.repository = new VisitorPurposeRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.visitors_purpose || data.visitors_purpose.trim() === '') {
      throw new Error('Visitor purpose name is required');
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

export default VisitorPurposeService;
