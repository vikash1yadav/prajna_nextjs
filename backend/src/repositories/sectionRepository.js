import Section from '../models/section.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

class SectionRepository {
  async get(id = null) {
    if (id !== null) {
      return await Section.findByPk(id);
    }
    return await Section.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Section.update(updateData, { where: { id } });
      return id;
    } else {
      const section = await Section.create(data);
      return section.id;
    }
  }

  async remove(id) {
    // Delete in a transaction or sequence
    const transaction = await sequelize.transaction();
    try {
      await Section.destroy({ where: { id }, transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getClassBySectionAll(classId) {
    const sql = `
      SELECT class_sections.id, class_sections.section_id, sections.section 
      FROM class_sections 
      INNER JOIN sections ON sections.id = class_sections.section_id 
      WHERE class_sections.class_id = :classId 
      ORDER BY class_sections.id
    `;
    return await sequelize.query(sql, {
      replacements: { classId },
      type: QueryTypes.SELECT
    });
  }

  async getClassTeacherSection(classId, staffId, currentSession) {
    const sql = `
      SELECT class_teacher.section_id 
      FROM class_teacher 
      INNER JOIN sections ON sections.id = class_teacher.section_id 
      INNER JOIN class_sections ON sections.id = class_sections.section_id 
      WHERE class_teacher.class_id = :classId 
        AND class_teacher.staff_id = :staffId 
        AND class_teacher.session_id = :currentSession
      GROUP BY class_teacher.section_id
    `;
    const sections = await sequelize.query(sql, {
      replacements: { classId, staffId, currentSession },
      type: QueryTypes.SELECT
    });

    for (let i = 0; i < sections.length; i++) {
      const query2 = `
        SELECT class_sections.id, sections.section 
        FROM class_sections 
        INNER JOIN sections ON sections.id = class_sections.section_id 
        WHERE sections.id = :sectionId
      `;
      const result2 = await sequelize.query(query2, {
        replacements: { sectionId: sections[i].section_id },
        type: QueryTypes.SELECT
      });
      if (result2.length > 0) {
        sections[i].id = result2[0].id;
        sections[i].section = result2[0].section;
      }
    }
    return sections;
  }

  async getSubjectTeacherSection(classId, teacherId) {
    const sql = `
      SELECT class_sections.id, sections.section, class_sections.section_id 
      FROM teacher_subjects 
      INNER JOIN class_sections ON teacher_subjects.class_section_id = class_sections.id 
      INNER JOIN sections ON sections.id = class_sections.section_id 
      WHERE class_sections.class_id = :classId 
        AND teacher_subjects.teacher_id = :teacherId
    `;
    return await sequelize.query(sql, {
      replacements: { classId, teacherId },
      type: QueryTypes.SELECT
    });
  }

  async getClassNameBySection(classId, sectionId) {
    const sql = `
      SELECT class_sections.id, class_sections.section_id, sections.section, classes.class 
      FROM class_sections 
      INNER JOIN sections ON sections.id = class_sections.section_id 
      INNER JOIN classes ON classes.id = class_sections.class_id 
      WHERE class_sections.class_id = :classId 
        AND class_sections.section_id = :sectionId 
      ORDER BY class_sections.id
    `;
    return await sequelize.query(sql, {
      replacements: { classId, sectionId },
      type: QueryTypes.SELECT
    });
  }

  async getClassAndSectionNameByClassIDSectionID(classId, sectionId) {
    const results = await this.getClassNameBySection(classId, sectionId);
    return results.length > 0 ? results[0] : null;
  }
}

export default SectionRepository;
