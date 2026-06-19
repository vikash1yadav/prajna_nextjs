import SourceRepository from '../repositories/sourceRepository.js';

class SourceService {
  constructor() {
    this.repository = new SourceRepository();
  }

  async get(id = null) {
    return await this.repository.get(id);
  }

  async add(data) {
    if (!data.source || data.source.trim() === '') {
      throw new Error('Source name is required');
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

export default SourceService;
