import Subject from '../models/subject.js';
import sequelize from '../config/database.js';
import { QueryTypes, Op } from 'sequelize';

class SubjectRepository {
  async get(id = null) {
    if (id !== null) {
      return await Subject.findByPk(id);
    }
    return await Subject.findAll({
      order: [['id', 'ASC']]
    });
  }

  async getByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    return await Subject.findAll({
      where: {
        id: {
          [Op.in]: ids
        }
      },
      order: [['id', 'ASC']]
    });
  }

  async checkNameExists(name) {
    return await Subject.findOne({
      where: { name }
    });
  }

  async checkCodeExists(code) {
    return await Subject.findOne({
      where: { code }
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Subject.update(updateData, { where: { id } });
      return id;
    } else {
      const subject = await Subject.create(data);
      return subject.id;
    }
  }

  async remove(id) {
    return await Subject.destroy({ where: { id } });
  }

  async getTeacherExamSubjects(staffId, currentSession) {
    // 1. Fetch class_teacher class/section maps
    const classTeacherSql = `
      SELECT class_id, section_id 
      FROM class_teacher 
      WHERE session_id = :currentSession
    `;
    const classTeacherSections = await sequelize.query(classTeacherSql, {
      replacements: { currentSession },
      type: QueryTypes.SELECT
    });

    const subjectIds = new Set();

    // 2. Loop through and fetch timetable subjects
    for (const mapping of classTeacherSections) {
      const sql = `
        SELECT sgs.subject_id 
        FROM subject_timetable st 
        INNER JOIN subject_group_subjects sgs ON st.subject_group_subject_id = sgs.id 
        WHERE st.class_id = :classId 
          AND st.section_id = :sectionId 
          AND st.staff_id = :staffId 
          AND st.session_id = :currentSession
      `;
      const results = await sequelize.query(sql, {
        replacements: {
          classId: mapping.class_id,
          sectionId: mapping.section_id,
          staffId,
          currentSession
        },
        type: QueryTypes.SELECT
      });
      for (const row of results) {
        subjectIds.add(row.subject_id);
      }
    }

    // 3. General timetable subjects for staff
    const generalSql = `
      SELECT sgs.subject_id 
      FROM subject_timetable st 
      INNER JOIN subject_group_subjects sgs ON st.subject_group_subject_id = sgs.id 
      WHERE st.staff_id = :staffId 
        AND st.session_id = :currentSession
    `;
    const generalResults = await sequelize.query(generalSql, {
      replacements: { staffId, currentSession },
      type: QueryTypes.SELECT
    });
    for (const row of generalResults) {
      subjectIds.add(row.subject_id);
    }

    return Array.from(subjectIds);
  }
}

export default SubjectRepository;
