import DispatchReceiveRepository from '../repositories/dispatchReceiveRepository.js';

class DispatchReceiveService {
  constructor() {
    this.repository = new DispatchReceiveRepository();
  }

  async get(id = null, type = null) {
    return await this.repository.get(id, type);
  }

  async add(data) {
    if (!data.type || !['dispatch', 'receive'].includes(data.type)) {
      throw new Error('Type must be either "dispatch" or "receive"');
    }
    if (!data.from_title && !data.to_title) {
      throw new Error('Either Sender or Recipient title is required');
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

export default DispatchReceiveService;
