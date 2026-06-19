import FeeRepository from '../repositories/feeRepository.js';

class FeeService {
  constructor() {
    this.feeRepository = new FeeRepository();
  }

  // --- Fee Types ---
  async getFeeTypes() {
    return await this.feeRepository.getFeeTypes();
  }

  async saveFeeType(data) {
    if (!data.type) {
      throw new Error('Fee type name is required');
    }
    if (!data.code) {
      throw new Error('Fee type code is required');
    }
    return await this.feeRepository.saveFeeType(data);
  }

  async deleteFeeType(id) {
    if (!id) {
      throw new Error('Fee Type ID is required');
    }
    return await this.feeRepository.deleteFeeType(id);
  }

  // --- Fee Groups ---
  async getFeeGroups() {
    return await this.feeRepository.getFeeGroups();
  }

  async saveFeeGroup(data) {
    if (!data.name) {
      throw new Error('Fee group name is required');
    }
    return await this.feeRepository.saveFeeGroup(data);
  }

  async deleteFeeGroup(id) {
    if (!id) {
      throw new Error('Fee Group ID is required');
    }
    return await this.feeRepository.deleteFeeGroup(id);
  }

  // --- Fee Masters ---
  async getFeeMasters(classId = null, currentSession = 21) {
    return await this.feeRepository.getFeeMasters(classId, currentSession);
  }

  async saveFeeMaster(data, currentSession = 21) {
    if (!data.fee_groups_id) {
      throw new Error('Fee group is required');
    }
    if (!data.feetype_id) {
      throw new Error('Fee type is required');
    }
    if (data.amount === undefined || data.amount === null) {
      throw new Error('Amount is required');
    }
    return await this.feeRepository.saveFeeMaster(data, currentSession);
  }

  async deleteFeeMaster(id) {
    if (!id) {
      throw new Error('Fee Master ID is required');
    }
    return await this.feeRepository.deleteFeeMaster(id);
  }

  // --- Fee Discounts ---
  async getDiscounts(currentSession = 21) {
    return await this.feeRepository.getDiscounts(currentSession);
  }

  async saveDiscount(data, currentSession = 21) {
    if (!data.name) {
      throw new Error('Discount name is required');
    }
    if (!data.code) {
      throw new Error('Discount code is required');
    }
    if (!data.type) {
      throw new Error('Discount type is required');
    }
    return await this.feeRepository.saveDiscount(data, currentSession);
  }

  async deleteDiscount(id) {
    if (!id) {
      throw new Error('Discount ID is required');
    }
    return await this.feeRepository.deleteDiscount(id);
  }

  async searchAssignDiscountStudents(classId, sectionId, discountId, categoryId = null, gender = null, rteStatus = null, currentSession = 21) {
    if (!discountId) {
      throw new Error('Discount ID is required');
    }
    return await this.feeRepository.searchAssignDiscountStudents(classId, sectionId, discountId, categoryId, gender, rteStatus, currentSession);
  }

  async allotDiscount(discountId, studentSessionIds, studentList) {
    if (!discountId) {
      throw new Error('Discount ID is required');
    }
    if (!Array.isArray(studentSessionIds) || !Array.isArray(studentList)) {
      throw new Error('Student lists must be arrays');
    }
    return await this.feeRepository.allotDiscount(discountId, studentSessionIds, studentList);
  }

  async applyDiscount(studentFeesDiscountId, paymentId, description) {
    if (!studentFeesDiscountId) {
      throw new Error('Student Fees Discount ID is required');
    }
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }
    return await this.feeRepository.applyDiscount(studentFeesDiscountId, paymentId, description);
  }

  // --- Fees Reminders ---
  async getReminders() {
    return await this.feeRepository.getReminders();
  }

  async updateRemindersBatch(reminders) {
    if (!Array.isArray(reminders)) {
      throw new Error('Reminders list must be an array');
    }
    return await this.feeRepository.updateRemindersBatch(reminders);
  }

  // --- Student Fees & Collection ---
  async getStudentFees(classId = null, sectionId = null, studentId = null, currentSession = 21) {
    return await this.feeRepository.getStudentFeesByClassSectionStudent(classId, sectionId, studentId, currentSession);
  }

  async collectFee(depositData) {
    if (!depositData.student_fees_master_id) {
      throw new Error('student_fees_master_id is required');
    }
    if (!depositData.fee_groups_feetype_id) {
      throw new Error('fee_groups_feetype_id is required');
    }
    if (depositData.amount === undefined || depositData.amount === null) {
      throw new Error('amount is required');
    }
    if (!depositData.date) {
      throw new Error('payment date is required');
    }

    return await this.feeRepository.feeDeposit(depositData);
  }

  async getFeeDeposits(studentSessionId) {
    if (!studentSessionId) {
      throw new Error('Student Session ID is required');
    }
    return await this.feeRepository.getFeeDeposits(studentSessionId);
  }

  // --- Offline Bank Payments ---
  async getOfflinePayments() {
    return await this.feeRepository.getOfflinePayments();
  }

  async updateOfflinePaymentStatus(id, data) {
    if (!id) {
      throw new Error('Offline payment request ID is required');
    }
    if (!data.is_active) {
      throw new Error('Payment status is required');
    }
    if (data.amount === undefined || data.amount === null) {
      throw new Error('Approved amount is required');
    }
    return await this.feeRepository.updateOfflinePaymentStatus(id, data);
  }

  // --- Search Payment ---
  async searchPayment(paymentId) {
    if (!paymentId || !paymentId.includes('/')) {
      throw new Error('Invalid Payment ID format. Expected invoice_id/sub_invoice_id');
    }
    const [invoiceIdStr, subInvoiceIdStr] = paymentId.split('/');
    const invoiceId = parseInt(invoiceIdStr);
    const subInvoiceId = parseInt(subInvoiceIdStr);
    if (isNaN(invoiceId) || isNaN(subInvoiceId)) {
      throw new Error('Invalid Payment ID format');
    }
    return await this.feeRepository.getPaymentByInvoice(invoiceId, subInvoiceId);
  }

  // --- Search Due Fees ---
  async getDueFees(classId, sectionId, feeGroupFeetypeIds) {
    if (!feeGroupFeetypeIds) {
      throw new Error('Fee Group Feetype IDs are required');
    }
    // Convert comma-separated string or array to array of numbers
    let ids = [];
    if (Array.isArray(feeGroupFeetypeIds)) {
      ids = feeGroupFeetypeIds.map(Number);
    } else if (typeof feeGroupFeetypeIds === 'string') {
      ids = feeGroupFeetypeIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }
    return await this.feeRepository.getDueFees(classId, sectionId, ids);
  }

  // --- Carry Forward ---
  async getCarryForwardList(classId, sectionId, currentSession = 21) {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    if (!sectionId) {
      throw new Error('Section ID is required');
    }
    return await this.feeRepository.getCarryForwardList(classId, sectionId, currentSession);
  }

  async saveCarryForward(classId, sectionId, dueDate, students, currentSession = 21) {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    if (!sectionId) {
      throw new Error('Section ID is required');
    }
    if (!dueDate) {
      throw new Error('Due date is required');
    }
    if (!Array.isArray(students)) {
      throw new Error('Students list must be an array');
    }
    return await this.feeRepository.saveCarryForward(classId, sectionId, dueDate, students, currentSession);
  }
}

export default FeeService;


