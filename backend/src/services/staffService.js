import StaffRepository from '../repositories/staffRepository.js';
import sequelize from '../config/database.js';

class StaffService {
  constructor() {
    this.staffRepository = new StaffRepository();
  }

  // --- STAFF BUSINESS METHODS ---
  async getStaff(id = null, roleId = null) {
    return await this.staffRepository.get(id, roleId);
  }

  async getStaffProfile(id) {
    if (!id) {
      throw new Error('Staff ID is required');
    }
    const staff = await this.staffRepository.get(id);
    if (!staff) {
      return null;
    }
    const role = await this.staffRepository.getStaffRole(id);
    return {
      ...staff.toJSON(),
      role: role || null
    };
  }

  async saveStaff(staffData, roleId = null) {
    if (!staffData.name) {
      throw new Error('Staff name is required');
    }
    if (!staffData.email) {
      throw new Error('Staff email is required');
    }
    if (!staffData.employee_id) {
      throw new Error('Employee ID is required');
    }

    // Validate email uniqueness
    const existingEmail = await this.staffRepository.getByEmail(staffData.email);
    if (existingEmail && (!staffData.id || existingEmail.id !== parseInt(staffData.id))) {
      throw new Error('Email already exists');
    }

    // Validate employee ID uniqueness
    const existingEmpId = await this.staffRepository.getByEmployeeId(staffData.employee_id);
    if (existingEmpId && (!staffData.id || existingEmpId.id !== parseInt(staffData.id))) {
      throw new Error('Employee ID already exists');
    }

    const transaction = await sequelize.transaction();
    try {
      // 1. Save Staff Profile
      const staffId = await this.staffRepository.add(staffData);

      // 2. Map Role if provided
      if (roleId) {
        await this.staffRepository.removeStaffRole(staffId, transaction);
        await this.staffRepository.addStaffRole(staffId, roleId, transaction);
      }

      await transaction.commit();
      return staffId;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteStaff(id) {
    if (!id) {
      throw new Error('Staff ID is required');
    }
    return await this.staffRepository.remove(id);
  }

  async searchStaff(searchterm, active = 1) {
    if (!searchterm) {
      return await this.staffRepository.get();
    }
    return await this.staffRepository.searchFullText(searchterm, active);
  }

  // --- ROLE BUSINESS METHODS ---
  async getRoles(id = null) {
    return await this.staffRepository.getRoles(id);
  }

  async saveRole(roleData) {
    if (!roleData.name) {
      throw new Error('Role name is required');
    }
    // Check if role name already exists
    const id = roleData.id ? parseInt(roleData.id) : 0;
    const existing = await this.staffRepository.checkRoleNameExists(roleData.name, id);
    if (existing) {
      throw new Error('Record already exists');
    }
    return await this.staffRepository.addRole(roleData);
  }

  async deleteRole(id) {
    if (!id) {
      throw new Error('Role ID is required');
    }
    // Check if any active staff are assigned to this role
    const activeStaffCount = await this.staffRepository.countRoles(id);
    if (activeStaffCount > 0) {
      throw new Error('Cannot delete role as active staff are assigned to it');
    }
    return await this.staffRepository.removeRole(id);
  }

  async countStaffByRole(roleId) {
    if (!roleId) {
      throw new Error('Role ID is required');
    }
    return await this.staffRepository.countRoles(roleId);
  }
}

export default StaffService;
