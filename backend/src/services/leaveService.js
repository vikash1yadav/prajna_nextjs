import LeaveRepository from '../repositories/leaveRepository.js';

class LeaveService {
  constructor() {
    this.leaveRepository = new LeaveRepository();
  }

  async getAll(classId, sectionId, currentSession = 21) {
    return await this.leaveRepository.getAll(classId, sectionId, currentSession);
  }

  async getById(id) {
    if (!id) throw new Error('Leave ID is required');
    return await this.leaveRepository.getById(id);
  }

  async create(data) {
    if (!data.student_session_id) throw new Error('Student Session ID is required');
    if (!data.from_date) throw new Error('From Date is required');
    if (!data.to_date) throw new Error('To Date is required');
    if (!data.apply_date) throw new Error('Apply Date is required');
    if (!data.reason) throw new Error('Reason is required');

    // Default values if not provided
    if (data.status === undefined) data.status = 0; // Pending
    if (data.request_type === undefined) data.request_type = 1;

    return await this.leaveRepository.create(data);
  }

  async updateStatus(id, status, staffId = null) {
    if (!id) throw new Error('Leave ID is required');
    if (status === undefined) throw new Error('Status is required');

    const updateData = {
      status: parseInt(status)
    };

    if (parseInt(status) !== 0) {
      updateData.approve_by = staffId || 1; // Default to admin staff ID if not specified
      updateData.approve_date = new Date().toISOString().split('T')[0];
    } else {
      updateData.approve_by = null;
      updateData.approve_date = null;
    }

    return await this.leaveRepository.update(id, updateData);
  }

  async delete(id) {
    if (!id) throw new Error('Leave ID is required');
    return await this.leaveRepository.delete(id);
  }
}

export default LeaveService;
