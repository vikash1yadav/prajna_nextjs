import OnlineAdmissionRepository from '../repositories/onlineAdmissionRepository.js';

class OnlineAdmissionService {
  constructor() {
    this.onlineAdmissionRepository = new OnlineAdmissionRepository();
  }

  async getAdmissions(classId = null, sectionId = null, searchterm = null) {
    return await this.onlineAdmissionRepository.getAll(classId, sectionId, searchterm);
  }

  async deleteAdmission(id) {
    if (!id) throw new Error('ID is required');
    return await this.onlineAdmissionRepository.remove(id);
  }

  async enrollAdmission(id, session_id = 21) {
    if (!id) throw new Error('ID is required');
    return await this.onlineAdmissionRepository.enroll(id, session_id);
  }
}

export default OnlineAdmissionService;
