import DisableReasonRepository from '../repositories/disableReasonRepository.js';

class DisableReasonService {
  constructor() {
    this.disableReasonRepository = new DisableReasonRepository();
  }

  async getReasons(id = null) {
    return await this.disableReasonRepository.get(id);
  }

  async saveReason(reasonData) {
    if (!reasonData.reason || reasonData.reason.trim() === '') {
      throw new Error('Reason name is required');
    }
    return await this.disableReasonRepository.add(reasonData);
  }

  async deleteReason(id) {
    if (!id) {
      throw new Error('Reason ID is required');
    }
    return await this.disableReasonRepository.remove(id);
  }
}

export default DisableReasonService;
