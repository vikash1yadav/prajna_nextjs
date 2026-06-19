import FeeService from '../services/feeService.js';

class FeeController {
  constructor() {
    this.feeService = new FeeService();
  }

  // --- Fee Types CRUD ---
  getFeeTypes = async (req, res, next) => {
    try {
      const data = await this.feeService.getFeeTypes();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveFeeType = async (req, res, next) => {
    try {
      const id = await this.feeService.saveFeeType(req.body);
      return res.status(200).json({ success: true, message: 'Fee type saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  updateFeeType = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = { ...req.body, id: parseInt(id) };
      await this.feeService.saveFeeType(data);
      return res.status(200).json({ success: true, message: 'Fee type updated successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteFeeType = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.feeService.deleteFeeType(parseInt(id));
      return res.status(200).json({ success: true, message: 'Fee type deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Fee Groups CRUD ---
  getFeeGroups = async (req, res, next) => {
    try {
      const data = await this.feeService.getFeeGroups();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveFeeGroup = async (req, res, next) => {
    try {
      const id = await this.feeService.saveFeeGroup(req.body);
      return res.status(200).json({ success: true, message: 'Fee group saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  updateFeeGroup = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = { ...req.body, id: parseInt(id) };
      await this.feeService.saveFeeGroup(data);
      return res.status(200).json({ success: true, message: 'Fee group updated successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteFeeGroup = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.feeService.deleteFeeGroup(parseInt(id));
      return res.status(200).json({ success: true, message: 'Fee group deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Fees Master CRUD ---
  getFeeMasters = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const data = await this.feeService.getFeeMasters(classId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveFeeMaster = async (req, res, next) => {
    try {
      const session_id = req.body.session_id ? parseInt(req.body.session_id) : 21;
      const id = await this.feeService.saveFeeMaster(req.body, session_id);
      return res.status(200).json({ success: true, message: 'Fee master saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  updateFeeMaster = async (req, res, next) => {
    try {
      const { id } = req.params;
      const session_id = req.body.session_id ? parseInt(req.body.session_id) : 21;
      const data = { ...req.body, id: parseInt(id) };
      await this.feeService.saveFeeMaster(data, session_id);
      return res.status(200).json({ success: true, message: 'Fee master updated successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteFeeMaster = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.feeService.deleteFeeMaster(parseInt(id));
      return res.status(200).json({ success: true, message: 'Fee master deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Fees Discount CRUD & Allotment ---
  getDiscounts = async (req, res, next) => {
    try {
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const data = await this.feeService.getDiscounts(session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveDiscount = async (req, res, next) => {
    try {
      const session_id = req.body.session_id ? parseInt(req.body.session_id) : 21;
      const id = await this.feeService.saveDiscount(req.body, session_id);
      return res.status(200).json({ success: true, message: 'Fee discount saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  updateDiscount = async (req, res, next) => {
    try {
      const { id } = req.params;
      const session_id = req.body.session_id ? parseInt(req.body.session_id) : 21;
      const data = { ...req.body, id: parseInt(id) };
      await this.feeService.saveDiscount(data, session_id);
      return res.status(200).json({ success: true, message: 'Fee discount updated successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteDiscount = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.feeService.deleteDiscount(parseInt(id));
      return res.status(200).json({ success: true, message: 'Fee discount deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  searchAssignDiscountStudents = async (req, res, next) => {
    try {
      const { class_id, section_id, discount_id, category_id, gender, rte_status } = req.query;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const data = await this.feeService.searchAssignDiscountStudents(
        class_id ? parseInt(class_id) : null,
        section_id ? parseInt(section_id) : null,
        discount_id ? parseInt(discount_id) : null,
        category_id ? parseInt(category_id) : null,
        gender || null,
        rte_status || null,
        session_id
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  allotDiscount = async (req, res, next) => {
    try {
      const { discount_id, student_session_ids, student_list } = req.body;
      await this.feeService.allotDiscount(
        parseInt(discount_id),
        student_session_ids.map(Number),
        student_list.map(Number)
      );
      return res.status(200).json({ success: true, message: 'Discount alloted/unalloted successfully' });
    } catch (error) {
      next(error);
    }
  };

  applyDiscount = async (req, res, next) => {
    try {
      const { student_fees_discount_id, payment_id, description } = req.body;
      await this.feeService.applyDiscount(
        parseInt(student_fees_discount_id),
        payment_id,
        description
      );
      return res.status(200).json({ success: true, message: 'Discount applied successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Fees Reminders ---
  getReminders = async (req, res, next) => {
    try {
      const data = await this.feeService.getReminders();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateRemindersBatch = async (req, res, next) => {
    try {
      await this.feeService.updateRemindersBatch(req.body.reminders);
      return res.status(200).json({ success: true, message: 'Reminders updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Student Fees & Deposits ---
  getStudentFees = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const studentId = req.query.student_id ? parseInt(req.query.student_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.feeService.getStudentFees(classId, sectionId, studentId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  depositFee = async (req, res, next) => {
    try {
      const result = await this.feeService.collectFee(req.body);
      return res.status(200).json({
        success: true,
        message: 'Fee deposit transaction completed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getFeeDeposits = async (req, res, next) => {
    try {
      const studentSessionId = req.query.student_session_id ? parseInt(req.query.student_session_id) : null;
      if (!studentSessionId) {
        return res.status(400).json({ success: false, error: 'Student Session ID is required' });
      }
      const data = await this.feeService.getFeeDeposits(studentSessionId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  // --- Offline Bank Payments ---
  getOfflinePayments = async (req, res, next) => {
    try {
      const data = await this.feeService.getOfflinePayments();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateOfflinePayment = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.feeService.updateOfflinePaymentStatus(parseInt(id), req.body);
      return res.status(200).json({ success: true, message: 'Offline payment updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  };

  // --- Search Payment ---
  searchPayment = async (req, res, next) => {
    try {
      const paymentId = req.query.payment_id;
      if (!paymentId) {
        return res.status(400).json({ success: false, error: 'Payment ID is required' });
      }
      const data = await this.feeService.searchPayment(paymentId);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Payment receipt not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  // --- Search Due Fees ---
  getDueFees = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const feeGroupFeetypeIds = req.query.fee_groups;
      
      const data = await this.feeService.getDueFees(classId, sectionId, feeGroupFeetypeIds);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  // --- Carry Forward ---
  getCarryForwardList = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const sessionId = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.feeService.getCarryForwardList(classId, sectionId, sessionId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveCarryForward = async (req, res, next) => {
    try {
      const classId = req.body.class_id ? parseInt(req.body.class_id) : null;
      const sectionId = req.body.section_id ? parseInt(req.body.section_id) : null;
      const dueDate = req.body.due_date;
      const students = req.body.students;
      const sessionId = req.body.session_id ? parseInt(req.body.session_id) : 21;

      const result = await this.feeService.saveCarryForward(classId, sectionId, dueDate, students, sessionId);
      return res.status(200).json({ success: true, message: 'Carry forward applied successfully', data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default FeeController;


