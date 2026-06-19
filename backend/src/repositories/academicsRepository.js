import sequelize from '../config/database.js';
import SubjectGroup from '../models/subjectGroup.js';
import SubjectGroupSubject from '../models/subjectGroupSubject.js';
import SubjectGroupClassSection from '../models/subjectGroupClassSection.js';
import ClassTeacher from '../models/classTeacher.js';
import SubjectTimetable from '../models/subjectTimetable.js';
import StudentSession from '../models/studentSession.js';

class AcademicsRepository {
  // -------------------------------------------------------------
  // Subject Groups
  // -------------------------------------------------------------
  async getSubjectGroups(sessionId) {
    // We can run raw SQL query to fetch all group info with subjects and class/sections
    const query = `
      SELECT sg.id as id, sg.name as name, sg.description as description, sg.session_id as session_id,
             sgs.id as sgs_id, sgs.subject_id as subject_id, sub.name as subject_name, sub.code as subject_code, sub.type as subject_type,
             sgcs.id as sgcs_id, sgcs.class_section_id as class_section_id, cs.class_id, cs.section_id, c.class as class_name, s.section as section_name
      FROM subject_groups sg
      LEFT JOIN subject_group_subjects sgs ON sg.id = sgs.subject_group_id
      LEFT JOIN subjects sub ON sgs.subject_id = sub.id
      LEFT JOIN subject_group_class_sections sgcs ON sg.id = sgcs.subject_group_id
      LEFT JOIN class_sections cs ON sgcs.class_section_id = cs.id
      LEFT JOIN classes c ON cs.class_id = c.id
      LEFT JOIN sections s ON cs.section_id = s.id
      WHERE sg.session_id = :sessionId OR :sessionId IS NULL
    `;
    const results = await sequelize.query(query, {
      replacements: { sessionId: sessionId || null },
      type: sequelize.QueryTypes.SELECT
    });

    // Group the results by subject group id
    const groupsMap = {};
    for (const row of results) {
      if (!groupsMap[row.id]) {
        groupsMap[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          session_id: row.session_id,
          subjects: [],
          sections: []
        };
      }

      const group = groupsMap[row.id];

      // Add subject if present and not already added
      if (row.subject_id && !group.subjects.some(sub => sub.id === row.subject_id)) {
        group.subjects.push({
          id: row.subject_id,
          sgs_id: row.sgs_id,
          name: row.subject_name,
          code: row.subject_code,
          type: row.subject_type
        });
      }

      // Add class section if present and not already added
      if (row.class_section_id && !group.sections.some(sec => sec.class_section_id === row.class_section_id)) {
        group.sections.push({
          class_section_id: row.class_section_id,
          sgcs_id: row.sgcs_id,
          class_id: row.class_id,
          section_id: row.section_id,
          class_name: row.class_name,
          section_name: row.section_name
        });
      }
    }

    return Object.values(groupsMap);
  }

  async saveSubjectGroup(id, name, description, subjectIds, classSectionIds, sessionId) {
    const transaction = await sequelize.transaction();
    try {
      let group;
      if (id) {
        group = await SubjectGroup.findByPk(id, { transaction });
        if (!group) throw new Error('Subject Group not found');
        group.name = name;
        group.description = description;
        await group.save({ transaction });
      } else {
        group = await SubjectGroup.create({
          name,
          description,
          session_id: sessionId
        }, { transaction });
      }

      const groupId = group.id;

      // Sync subjects: Delete existing and recreate
      await SubjectGroupSubject.destroy({
        where: { subject_group_id: groupId },
        transaction
      });

      if (subjectIds && subjectIds.length > 0) {
        const subjectsData = subjectIds.map(subId => ({
          subject_group_id: groupId,
          subject_id: parseInt(subId),
          session_id: sessionId
        }));
        await SubjectGroupSubject.bulkCreate(subjectsData, { transaction });
      }

      // Sync class sections: Delete existing and recreate
      await SubjectGroupClassSection.destroy({
        where: { subject_group_id: groupId },
        transaction
      });

      if (classSectionIds && classSectionIds.length > 0) {
        const sectionsData = classSectionIds.map(csId => ({
          subject_group_id: groupId,
          class_section_id: parseInt(csId),
          session_id: sessionId,
          is_active: 1
        }));
        await SubjectGroupClassSection.bulkCreate(sectionsData, { transaction });
      }

      await transaction.commit();
      return group;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async deleteSubjectGroup(id) {
    const transaction = await sequelize.transaction();
    try {
      await SubjectGroupSubject.destroy({ where: { subject_group_id: id }, transaction });
      await SubjectGroupClassSection.destroy({ where: { subject_group_id: id }, transaction });
      const deleted = await SubjectGroup.destroy({ where: { id }, transaction });
      await transaction.commit();
      return deleted > 0;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // -------------------------------------------------------------
  // Class Teachers
  // -------------------------------------------------------------
  async getClassTeachers(sessionId) {
    const query = `
      SELECT ct.id as ct_id, ct.class_id, ct.section_id, ct.staff_id,
             c.class as class_name, s.section as section_name,
             st.name as staff_name, st.surname as staff_surname, st.employee_id
      FROM class_teacher ct
      INNER JOIN classes c ON ct.class_id = c.id
      INNER JOIN sections s ON ct.section_id = s.id
      INNER JOIN staff st ON ct.staff_id = st.id
      WHERE ct.session_id = :sessionId OR :sessionId IS NULL
    `;
    const results = await sequelize.query(query, {
      replacements: { sessionId: sessionId || null },
      type: sequelize.QueryTypes.SELECT
    });

    // Group teachers by class and section mapping
    const mappingsMap = {};
    for (const row of results) {
      const key = `${row.class_id}_${row.section_id}`;
      if (!mappingsMap[key]) {
        mappingsMap[key] = {
          class_id: row.class_id,
          section_id: row.section_id,
          class_name: row.class_name,
          section_name: row.section_name,
          teachers: []
        };
      }
      mappingsMap[key].teachers.push({
        ct_id: row.ct_id,
        staff_id: row.staff_id,
        name: `${row.staff_name || ''} ${row.staff_surname || ''}`.trim(),
        employee_id: row.employee_id
      });
    }

    return Object.values(mappingsMap);
  }

  async assignClassTeachers(classId, sectionId, staffIds, sessionId) {
    const transaction = await sequelize.transaction();
    try {
      // Delete existing assignments for this class and section
      await ClassTeacher.destroy({
        where: { class_id: classId, section_id: sectionId, session_id: sessionId },
        transaction
      });

      // Insert new assignments
      if (staffIds && staffIds.length > 0) {
        const records = staffIds.map(staffId => ({
          class_id: classId,
          section_id: sectionId,
          staff_id: parseInt(staffId),
          session_id: sessionId
        }));
        await ClassTeacher.bulkCreate(records, { transaction });
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // -------------------------------------------------------------
  // Timetables
  // -------------------------------------------------------------
  async getTimetable(classId, sectionId, subjectGroupId, sessionId) {
    const query = `
      SELECT st.*, sub.name as subject_name, sub.code as subject_code,
             staff.name as staff_name, staff.surname as staff_surname
      FROM subject_timetable st
      INNER JOIN subject_group_subjects sgs ON st.subject_group_subject_id = sgs.id
      INNER JOIN subjects sub ON sgs.subject_id = sub.id
      LEFT JOIN staff ON st.staff_id = staff.id
      WHERE st.class_id = :classId
        AND st.section_id = :sectionId
        AND st.subject_group_id = :subjectGroupId
        AND st.session_id = :sessionId
    `;
    return await sequelize.query(query, {
      replacements: { classId, sectionId, subjectGroupId, sessionId },
      type: sequelize.QueryTypes.SELECT
    });
  }

  async saveTimetable(classId, sectionId, subjectGroupId, entries, sessionId) {
    const transaction = await sequelize.transaction();
    try {
      // Remove existing timetable entries for class + section + subject group in session
      await SubjectTimetable.destroy({
        where: { class_id: classId, section_id: sectionId, subject_group_id: subjectGroupId, session_id: sessionId },
        transaction
      });

      // Insert new entries
      if (entries && entries.length > 0) {
        const records = entries.map(entry => ({
          session_id: sessionId,
          class_id: classId,
          section_id: sectionId,
          subject_group_id: subjectGroupId,
          subject_group_subject_id: parseInt(entry.subject_group_subject_id),
          staff_id: parseInt(entry.staff_id),
          day: entry.day,
          time_from: entry.time_from,
          time_to: entry.time_to,
          start_time: entry.start_time || null,
          end_time: entry.end_time || null,
          room_no: entry.room_no || null
        }));
        await SubjectTimetable.bulkCreate(records, { transaction });
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async getTeacherTimetable(staffId, sessionId) {
    const query = `
      SELECT st.*, c.class as class_name, s.section as section_name,
             sub.name as subject_name, sub.code as subject_code
      FROM subject_timetable st
      INNER JOIN classes c ON st.class_id = c.id
      INNER JOIN sections s ON st.section_id = s.id
      INNER JOIN subject_group_subjects sgs ON st.subject_group_subject_id = sgs.id
      INNER JOIN subjects sub ON sgs.subject_id = sub.id
      WHERE st.staff_id = :staffId
        AND st.session_id = :sessionId
      ORDER BY FIELD(st.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), st.start_time
    `;
    return await sequelize.query(query, {
      replacements: { staffId, sessionId },
      type: sequelize.QueryTypes.SELECT
    });
  }

  // -------------------------------------------------------------
  // Student Promotion
  // -------------------------------------------------------------
  async promoteStudents(studentSessionIds, fromClassId, fromSectionId, toClassId, toSectionId, fromSessionId, toSessionId) {
    const transaction = await sequelize.transaction();
    try {
      const promoted = [];
      for (const ssId of studentSessionIds) {
        // Find existing student session record to copy student details
        const prevSessionRecord = await StudentSession.findByPk(ssId, { transaction });
        if (prevSessionRecord) {
          // Check if already promoted to next session to avoid duplicates
          const exists = await StudentSession.findOne({
            where: {
              student_id: prevSessionRecord.student_id,
              session_id: toSessionId
            },
            transaction
          });

          if (!exists) {
            const newSessionRecord = await StudentSession.create({
              student_id: prevSessionRecord.student_id,
              class_id: toClassId,
              section_id: toSectionId,
              session_id: toSessionId,
              is_active: 'yes' // Mapped to mysql type
            }, { transaction });
            promoted.push(newSessionRecord);
          }
        }
      }
      await transaction.commit();
      return promoted;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

export default AcademicsRepository;
