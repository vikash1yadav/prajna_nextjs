import ClassModel from '../models/class.js';
import ClassSection from '../models/classSection.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

class ClassRepository {
  async get(id = null) {
    if (id !== null) {
      return await ClassModel.findByPk(id);
    }
    return await ClassModel.findAll({
      order: [['id', 'ASC']]
    });
  }

  async checkDataExists(className) {
    return await ClassModel.findOne({
      where: { class: className }
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await ClassModel.update(updateData, { where: { id } });
      return id;
    } else {
      const newClass = await ClassModel.create(data);
      return newClass.id;
    }
  }

  async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      // Delete Class
      await ClassModel.destroy({ where: { id }, transaction });
      // Delete Class-Section Mappings
      await ClassSection.destroy({ where: { class_id: id }, transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getSectionsByClassId(classId) {
    const sql = `
      SELECT sections.id, sections.section 
      FROM class_sections 
      INNER JOIN sections ON class_sections.section_id = sections.id 
      WHERE class_sections.class_id = :classId
    `;
    return await sequelize.query(sql, {
      replacements: { classId },
      type: QueryTypes.SELECT
    });
  }

  async addClassSectionMapping(classId, sectionId, transaction = null) {
    const options = transaction ? { transaction } : {};
    return await ClassSection.create({
      class_id: classId,
      section_id: sectionId,
      is_active: 'no'
    }, options);
  }

  async removeClassSectionMappings(classId, transaction = null) {
    const options = transaction ? { transaction } : {};
    return await ClassSection.destroy({
      where: { class_id: classId }
    }, options);
  }

  async getClassTeacher(currentSession) {
    const sql = `
      SELECT class_teacher.*, classes.class, sections.section 
      FROM class_teacher 
      INNER JOIN classes ON classes.id = class_teacher.class_id 
      INNER JOIN sections ON sections.id = class_teacher.section_id 
      WHERE class_teacher.session_id = :currentSession 
      GROUP BY class_teacher.class_id, class_teacher.section_id 
      ORDER BY LENGTH(classes.class), classes.class
    `;
    return await sequelize.query(sql, {
      replacements: { currentSession },
      type: QueryTypes.SELECT
    });
  }

  async getTeacherRestrictedMode(staffId) {
    // Legacy restriction logic query
    const sql = `
      SELECT classes.id, classes.class 
      FROM class_teacher 
      INNER JOIN classes ON classes.id = class_teacher.class_id 
      WHERE class_teacher.staff_id = :staffId
      GROUP BY class_teacher.class_id
    `;
    return await sequelize.query(sql, {
      replacements: { staffId },
      type: QueryTypes.SELECT
    });
  }
}

export default ClassRepository;
