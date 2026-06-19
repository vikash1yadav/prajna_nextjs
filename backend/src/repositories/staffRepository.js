import Staff from '../models/staff.js';
import Role from '../models/role.js';
import StaffRole from '../models/staffRole.js';
import sequelize from '../config/database.js';
import { QueryTypes, Op } from 'sequelize';

class StaffRepository {
  // --- STAFF METHODS ---
  async get(id = null) {
    if (id !== null) {
      return await Staff.findByPk(id);
    }
    return await Staff.findAll({
      order: [['id', 'ASC']]
    });
  }

  async getByEmail(email) {
    return await Staff.findOne({
      where: { email }
    });
  }

  async getByEmployeeId(employeeId) {
    return await Staff.findOne({
      where: { employee_id: employeeId }
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Staff.update(updateData, { where: { id } });
      return id;
    } else {
      const staff = await Staff.create(data);
      return staff.id;
    }
  }

  async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      await Staff.destroy({ where: { id }, transaction });
      await StaffRole.destroy({ where: { staff_id: id }, transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- STAFF ROLE MAPPING METHODS ---
  async getStaffRole(staffId) {
    const sql = `
      SELECT roles.*, staff_roles.id as staff_role_id, staff_roles.is_active as mapping_active
      FROM staff_roles
      INNER JOIN roles ON staff_roles.role_id = roles.id
      WHERE staff_roles.staff_id = :staffId
    `;
    const result = await sequelize.query(sql, {
      replacements: { staffId },
      type: QueryTypes.SELECT
    });
    return result.length > 0 ? result[0] : null;
  }

  async addStaffRole(staffId, roleId, transaction = null) {
    const options = transaction ? { transaction } : {};
    // Check if mapping already exists
    const existing = await StaffRole.findOne({
      where: { staff_id: staffId, role_id: roleId }
    });
    if (existing) {
      return existing.id;
    }
    const mapping = await StaffRole.create({
      staff_id: staffId,
      role_id: roleId,
      is_active: 0
    }, options);
    return mapping.id;
  }

  async removeStaffRole(staffId, transaction = null) {
    const options = transaction ? { transaction } : {};
    return await StaffRole.destroy({
      where: { staff_id: staffId }
    }, options);
  }

  // --- ROLE METHODS ---
  async getRoles(id = null) {
    if (id !== null) {
      return await Role.findByPk(id);
    }
    return await Role.findAll({
      order: [['id', 'ASC']]
    });
  }

  async addRole(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Role.update(updateData, { where: { id } });
      return id;
    } else {
      const role = await Role.create(data);
      return role.id;
    }
  }

  async removeRole(id) {
    return await Role.destroy({ where: { id } });
  }

  async checkRoleNameExists(name, id = 0) {
    return await Role.findOne({
      where: {
        name,
        id: {
          [Op.ne]: id
        }
      }
    });
  }

  async countRoles(roleId) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM staff_roles 
      INNER JOIN staff ON staff.id = staff_roles.staff_id 
      WHERE staff_roles.role_id = :roleId 
        AND staff.is_active = 1
    `;
    const result = await sequelize.query(sql, {
      replacements: { roleId },
      type: QueryTypes.SELECT
    });
    return result.length > 0 ? parseInt(result[0].count) : 0;
  }

  // --- SPECIAL SEARCH METHODS ---
  async searchFullText(searchterm, active = 1) {
    const term = `%${searchterm}%`;
    return await Staff.findAll({
      where: {
        is_active: active,
        [Op.or]: [
          { name: { [Op.like]: term } },
          { surname: { [Op.like]: term } },
          { email: { [Op.like]: term } },
          { employee_id: { [Op.like]: term } },
          { contact_no: { [Op.like]: term } }
        ]
      },
      order: [['id', 'ASC']]
    });
  }
}

export default StaffRepository;
