import Student from '../models/student.js';
import StudentSession from '../models/studentSession.js';
import sequelize from '../config/database.js';
import { QueryTypes, Op } from 'sequelize';

class StudentRepository {
  async get(id = null, currentSession = null, isActive = 'yes') {
    if (id !== null) {
      const sql = `
        SELECT students.*, 
          student_session.id as student_session_id,
          student_session.session_id,
          student_session.class_id,
          student_session.section_id,
          classes.class,
          sections.section,
          disable_reason.reason as disable_reason_text
        FROM students
        INNER JOIN student_session ON student_session.student_id = students.id
        INNER JOIN classes ON student_session.class_id = classes.id
        INNER JOIN sections ON student_session.section_id = sections.id
        LEFT JOIN disable_reason ON disable_reason.id = students.dis_reason
        WHERE students.id = :id 
          ${currentSession ? 'AND student_session.session_id = :currentSession' : ''}
      `;
      const result = await sequelize.query(sql, {
        replacements: { id, currentSession },
        type: QueryTypes.SELECT
      });
      return result.length > 0 ? result[0] : null;
    }

    const sql = `
      SELECT students.*, 
        student_session.id as student_session_id,
        student_session.session_id,
        student_session.class_id,
        student_session.section_id,
        classes.class,
        sections.section,
        disable_reason.reason as disable_reason_text
      FROM students
      INNER JOIN student_session ON student_session.student_id = students.id
      INNER JOIN classes ON student_session.class_id = classes.id
      INNER JOIN sections ON student_session.section_id = sections.id
      LEFT JOIN disable_reason ON disable_reason.id = students.dis_reason
      WHERE students.is_active = :isActive
        ${currentSession ? 'AND student_session.session_id = :currentSession' : ''}
      ORDER BY students.id DESC
    `;
    return await sequelize.query(sql, {
      replacements: { currentSession, isActive },
      type: QueryTypes.SELECT
    });
  }

  async searchByClassSection(classId = null, sectionId = null, currentSession = 21, isActive = 'yes') {
    const sql = `
      SELECT students.*, 
        student_session.id as student_session_id,
        student_session.session_id,
        student_session.class_id,
        student_session.section_id,
        classes.class,
        sections.section,
        disable_reason.reason as disable_reason_text
      FROM students
      INNER JOIN student_session ON student_session.student_id = students.id
      INNER JOIN classes ON student_session.class_id = classes.id
      INNER JOIN sections ON student_session.section_id = sections.id
      LEFT JOIN disable_reason ON disable_reason.id = students.dis_reason
      WHERE students.is_active = :isActive
        AND student_session.session_id = :currentSession
        ${classId ? 'AND student_session.class_id = :classId' : ''}
        ${sectionId ? 'AND student_session.section_id = :sectionId' : ''}
      ORDER BY students.admission_no ASC
    `;
    return await sequelize.query(sql, {
      replacements: { classId, sectionId, currentSession, isActive },
      type: QueryTypes.SELECT
    });
  }

  async searchFullText(searchterm, currentSession = 21, isActive = 'yes') {
    const term = `%${searchterm}%`;
    const sql = `
      SELECT students.*, 
        student_session.id as student_session_id,
        student_session.session_id,
        student_session.class_id,
        student_session.section_id,
        classes.class,
        sections.section,
        disable_reason.reason as disable_reason_text
      FROM students
      INNER JOIN student_session ON student_session.student_id = students.id
      INNER JOIN classes ON student_session.class_id = classes.id
      INNER JOIN sections ON student_session.section_id = sections.id
      LEFT JOIN disable_reason ON disable_reason.id = students.dis_reason
      WHERE students.is_active = :isActive
        AND student_session.session_id = :currentSession
        AND (
          students.firstname LIKE :term OR
          students.lastname LIKE :term OR
          students.admission_no LIKE :term OR
          students.roll_no LIKE :term OR
          students.email LIKE :term OR
          students.mobileno LIKE :term OR
          students.father_name LIKE :term
        )
      ORDER BY students.admission_no ASC
    `;
    return await sequelize.query(sql, {
      replacements: { term, currentSession, isActive },
      type: QueryTypes.SELECT
    });
  }

  async checkAdmissionNoExists(admissionNo, excludeId = 0) {
    return await Student.findOne({
      where: {
        admission_no: admissionNo,
        id: { [Op.ne]: excludeId }
      }
    });
  }

  async add(studentData, sessionData) {
    const transaction = await sequelize.transaction();
    try {
      let studentId;
      if (studentData.id) {
        studentId = parseInt(studentData.id);
        const { id, ...updateData } = studentData;
        await Student.update(updateData, { where: { id: studentId }, transaction });

        // Update student session if details exist
        if (sessionData && Object.keys(sessionData).length > 0) {
          await StudentSession.update(sessionData, {
            where: { student_id: studentId, session_id: sessionData.session_id },
            transaction
          });
        }
      } else {
        const student = await Student.create(studentData, { transaction });
        studentId = student.id;

        // Create student session link
        const sessionPayload = {
          student_id: studentId,
          ...sessionData
        };
        await StudentSession.create(sessionPayload, { transaction });
      }

      await transaction.commit();
      return studentId;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      await Student.destroy({ where: { id }, transaction });
      await StudentSession.destroy({ where: { student_id: id }, transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async searchMultiClassStudents(classId, sectionId, currentSession = 21) {
    // First, find the unique students matching the class and section criteria
    const sql = `
      SELECT DISTINCT students.*
      FROM students
      INNER JOIN student_session ON student_session.student_id = students.id
      WHERE students.is_active = 'yes'
        AND student_session.session_id = :currentSession
        ${classId ? 'AND student_session.class_id = :classId' : ''}
        ${sectionId ? 'AND student_session.section_id = :sectionId' : ''}
      ORDER BY students.firstname ASC
    `;
    const students = await sequelize.query(sql, {
      replacements: { classId, sectionId, currentSession },
      type: QueryTypes.SELECT
    });

    if (!students || students.length === 0) return [];

    // For each student, get ALL their sessions in the current session
    for (let student of students) {
      const sessionSql = `
        SELECT student_session.id, student_session.class_id, student_session.section_id, classes.class, sections.section
        FROM student_session
        LEFT JOIN classes ON student_session.class_id = classes.id
        LEFT JOIN sections ON student_session.section_id = sections.id
        WHERE student_session.student_id = :studentId
          AND student_session.session_id = :currentSession
      `;
      student.student_sessions = await sequelize.query(sessionSql, {
        replacements: { studentId: student.id, currentSession },
        type: QueryTypes.SELECT
      });
    }

    return students;
  }

  async updateMultiClassSessions(studentId, sessionsData, currentSession = 21) {
    const transaction = await sequelize.transaction();
    try {
      // Find existing sessions for this student
      const existingSessions = await StudentSession.findAll({
        where: { student_id: studentId, session_id: currentSession },
        transaction
      });

      const updatedIds = [];

      for (const session of sessionsData) {
        if (!session.class_id || !session.section_id) continue;
        
        // check if this class/section combo already exists for this student in this session
        const existing = existingSessions.find(s => 
          s.class_id === parseInt(session.class_id) && 
          s.section_id === parseInt(session.section_id)
        );

        if (existing) {
          updatedIds.push(existing.id);
        } else {
          const newSession = await StudentSession.create({
            student_id: studentId,
            session_id: currentSession,
            class_id: parseInt(session.class_id, 10),
            section_id: parseInt(session.section_id, 10)
          }, { transaction });
          updatedIds.push(newSession.id);
        }
      }

      // Delete any session that wasn't updated or created
      if (updatedIds.length > 0) {
        await StudentSession.destroy({
          where: {
            student_id: studentId,
            session_id: currentSession,
            id: { [Op.notIn]: updatedIds }
          },
          transaction
        });
      } else {
        // if updatedIds is empty, user removed all classes? We should probably prevent doing 0.
        // Or if allowed, delete all
        await StudentSession.destroy({
          where: {
            student_id: studentId,
            session_id: currentSession
          },
          transaction
        });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async bulkDelete(studentIds) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Delete from students
      await Student.destroy({
        where: { id: { [Op.in]: studentIds } },
        transaction
      });

      // 2. Delete from student_session
      await StudentSession.destroy({
        where: { student_id: { [Op.in]: studentIds } },
        transaction
      });

      // 3. Delete from users (student role)
      await sequelize.query(
        `DELETE FROM users WHERE role = 'student' AND user_id IN (:studentIds)`,
        {
          replacements: { studentIds },
          type: QueryTypes.DELETE,
          transaction
        }
      );

      // 4. Delete custom_field_values
      await sequelize.query(
        `DELETE FROM custom_field_values 
         WHERE belong_table_id IN (:studentIds)
           AND custom_field_id IN (
             SELECT id FROM custom_fields WHERE belong_to = 'students'
           )`,
        {
          replacements: { studentIds },
          type: QueryTypes.DELETE,
          transaction
        }
      );

      // 5. Delete orphaned parent users
      await sequelize.query(
        `DELETE FROM users 
         WHERE role = 'parent' 
           AND id NOT IN (
             SELECT DISTINCT parent_id FROM students WHERE parent_id IS NOT NULL AND parent_id != 0
           )`,
        {
          type: QueryTypes.DELETE,
          transaction
        }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default StudentRepository;
