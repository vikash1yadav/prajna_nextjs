import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import Department from '../models/department.js';
import StaffDesignation from '../models/staffDesignation.js';
import LeaveType from '../models/leaveType.js';
import StaffAttendance from '../models/staffAttendance.js';
import StaffLeaveRequest from '../models/staffLeaveRequest.js';
import StaffPayslip from '../models/staffPayslip.js';
import StaffRating from '../models/staffRating.js';

class HRController {
  // --- DEPARTMENTS ---
  getDepartments = async (req, res, next) => {
    try {
      const data = await Department.findAll({ order: [['id', 'ASC']] });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveDepartment = async (req, res, next) => {
    try {
      const { id, department_name, is_active } = req.body;
      let record;
      if (id) {
        await Department.update({ department_name, is_active }, { where: { id } });
        record = { id };
      } else {
        record = await Department.create({ department_name, is_active });
      }
      return res.status(200).json({ success: true, message: 'Department saved successfully', data: record });
    } catch (error) {
      next(error);
    }
  };

  deleteDepartment = async (req, res, next) => {
    try {
      const { id } = req.params;
      await Department.destroy({ where: { id } });
      return res.status(200).json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- DESIGNATIONS ---
  getDesignations = async (req, res, next) => {
    try {
      const data = await StaffDesignation.findAll({ order: [['id', 'ASC']] });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveDesignation = async (req, res, next) => {
    try {
      const { id, designation, is_active } = req.body;
      let record;
      if (id) {
        await StaffDesignation.update({ designation, is_active }, { where: { id } });
        record = { id };
      } else {
        record = await StaffDesignation.create({ designation, is_active });
      }
      return res.status(200).json({ success: true, message: 'Designation saved successfully', data: record });
    } catch (error) {
      next(error);
    }
  };

  deleteDesignation = async (req, res, next) => {
    try {
      const { id } = req.params;
      await StaffDesignation.destroy({ where: { id } });
      return res.status(200).json({ success: true, message: 'Designation deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- LEAVE TYPES ---
  getLeaveTypes = async (req, res, next) => {
    try {
      const data = await LeaveType.findAll({ order: [['id', 'ASC']] });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveLeaveType = async (req, res, next) => {
    try {
      const { id, type, is_active } = req.body;
      let record;
      if (id) {
        await LeaveType.update({ type, is_active }, { where: { id } });
        record = { id };
      } else {
        record = await LeaveType.create({ type, is_active });
      }
      return res.status(200).json({ success: true, message: 'Leave type saved successfully', data: record });
    } catch (error) {
      next(error);
    }
  };

  deleteLeaveType = async (req, res, next) => {
    try {
      const { id } = req.params;
      await LeaveType.destroy({ where: { id } });
      return res.status(200).json({ success: true, message: 'Leave type deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- STAFF LEAVE REQUESTS ---
  getLeaveRequests = async (req, res, next) => {
    try {
      const staffId = req.query.staff_id || null;
      let sql = `
        SELECT staff_leave_request.*, staff.name as firstname, staff.surname as lastname, staff.employee_id, leave_types.type as leave_type
        FROM staff_leave_request
        INNER JOIN staff ON staff_leave_request.staff_id = staff.id
        INNER JOIN leave_types ON staff_leave_request.leave_type_id = leave_types.id
      `;
      const replacements = {};
      if (staffId) {
        sql += ` WHERE staff_leave_request.staff_id = :staffId`;
        replacements.staffId = staffId;
      }
      sql += ` ORDER BY staff_leave_request.id DESC`;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT
      });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveLeaveRequest = async (req, res, next) => {
    try {
      const { id, staff_id, leave_type_id, leave_from, leave_to, leave_days, employee_remark, admin_remark, status, document_file } = req.body;
      let record;
      if (id) {
        const updateData = { admin_remark, status };
        if (status === 'approve' || status === 'disapprove') {
          updateData.approve_date = new Date().toISOString().split('T')[0];
        }
        await StaffLeaveRequest.update(updateData, { where: { id } });
        record = { id };
      } else {
        record = await StaffLeaveRequest.create({
          staff_id,
          leave_type_id,
          leave_from,
          leave_to,
          leave_days,
          employee_remark,
          status: 'pending',
          document_file: document_file || '',
          date: new Date().toISOString().split('T')[0]
        });
      }
      return res.status(200).json({ success: true, message: 'Leave request saved successfully', data: record });
    } catch (error) {
      next(error);
    }
  };

  deleteLeaveRequest = async (req, res, next) => {
    try {
      const { id } = req.params;
      await StaffLeaveRequest.destroy({ where: { id } });
      return res.status(200).json({ success: true, message: 'Leave request deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- STAFF ATTENDANCE ---
  getStaffAttendance = async (req, res, next) => {
    try {
      const { date, role_id } = req.query;
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date parameter is required' });
      }
      const roleId = role_id ? parseInt(role_id) : null;

      const sql = `
        SELECT staff.id, staff.name as firstname, staff.surname as lastname, staff.employee_id, roles.name as role_name, staff_attendance.id as attendance_id, staff_attendance.staff_attendance_type_id, staff_attendance.remark
        FROM staff
        INNER JOIN staff_roles ON staff.id = staff_roles.staff_id
        INNER JOIN roles ON staff_roles.role_id = roles.id
        LEFT JOIN staff_attendance ON staff.id = staff_attendance.staff_id AND staff_attendance.date = :date
        WHERE (:roleId IS NULL OR staff_roles.role_id = :roleId) AND staff.is_active = 1
        ORDER BY staff.id ASC
      `;

      const data = await sequelize.query(sql, {
        replacements: { date, roleId },
        type: QueryTypes.SELECT
      });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveStaffAttendance = async (req, res, next) => {
    try {
      const { date, attendance } = req.body; // attendance is array of { staff_id, staff_attendance_type_id, remark }
      if (!date || !Array.isArray(attendance)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }

      for (const item of attendance) {
        // Find existing record
        const existing = await StaffAttendance.findOne({
          where: { date, staff_id: item.staff_id }
        });

        if (existing) {
          await existing.update({
            staff_attendance_type_id: item.staff_attendance_type_id,
            remark: item.remark || ''
          });
        } else {
          await StaffAttendance.create({
            date,
            staff_id: item.staff_id,
            staff_attendance_type_id: item.staff_attendance_type_id,
            remark: item.remark || '',
            is_active: 1
          });
        }
      }

      return res.status(200).json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- STAFF RATINGS ---
  getStaffRatings = async (req, res, next) => {
    try {
      const sql = `
        SELECT staff_rating.*, staff.name as firstname, staff.surname as lastname, staff.employee_id
        FROM staff_rating
        INNER JOIN staff ON staff_rating.staff_id = staff.id
        ORDER BY staff_rating.id DESC
      `;
      const data = await sequelize.query(sql, { type: QueryTypes.SELECT });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  toggleRatingStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await StaffRating.update({ status }, { where: { id } });
      return res.status(200).json({ success: true, message: 'Rating status updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- STAFF PAYROLL ---
  getPayroll = async (req, res, next) => {
    try {
      const { month, year, role_id } = req.query;
      if (!month || !year) {
        return res.status(400).json({ success: false, message: 'Month and year are required' });
      }
      const roleId = role_id ? parseInt(role_id) : null;

      const sql = `
        SELECT staff.id, staff.name as firstname, staff.surname as lastname, staff.employee_id, staff.basic_salary, staff.payscale, roles.name as role_name, staff_payslip.id as payslip_id, staff_payslip.basic, staff_payslip.total_allowance, staff_payslip.total_deduction, staff_payslip.net_salary, staff_payslip.status
        FROM staff
        INNER JOIN staff_roles ON staff.id = staff_roles.staff_id
        INNER JOIN roles ON staff_roles.role_id = roles.id
        LEFT JOIN staff_payslip ON staff.id = staff_payslip.staff_id AND staff_payslip.month = :month AND staff_payslip.year = :year
        WHERE (:roleId IS NULL OR staff_roles.role_id = :roleId) AND staff.is_active = 1
        ORDER BY staff.id ASC
      `;

      const data = await sequelize.query(sql, {
        replacements: { month, year, roleId },
        type: QueryTypes.SELECT
      });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  savePayslip = async (req, res, next) => {
    try {
      const { id, staff_id, month, year, basic, total_allowance, total_deduction, net_salary, status, payment_mode, remark } = req.body;
      let record;
      if (id) {
        const updateData = { status, payment_mode, remark };
        if (status === 'paid') {
          updateData.payment_date = new Date().toISOString().split('T')[0];
        }
        await StaffPayslip.update(updateData, { where: { id } });
        record = { id };
      } else {
        record = await StaffPayslip.create({
          staff_id,
          month,
          year,
          basic,
          total_allowance,
          total_deduction,
          net_salary,
          status: 'generated',
          payment_mode: '',
          remark: remark || ''
        });
      }
      return res.status(200).json({ success: true, message: 'Payslip processed successfully', data: record });
    } catch (error) {
      next(error);
    }
  };
}

export default HRController;
