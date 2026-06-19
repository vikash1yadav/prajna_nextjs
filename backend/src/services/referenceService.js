import ReferenceRepository from '../repositories/referenceRepository.js';

class ReferenceService {
  constructor() {
    this.repository = new ReferenceRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.reference || data.reference.trim() === '') {
      throw new Error('Reference name is required');
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

export default ReferenceService;
