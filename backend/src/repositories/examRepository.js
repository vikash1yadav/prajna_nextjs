import Exam from '../models/exam.js';
import ExamSchedule from '../models/examSchedule.js';
import ExamGroup from '../models/examGroup.js';
import Grade from '../models/grade.js';
import MarkDivision from '../models/markDivision.js';
import TemplateAdmitcard from '../models/templateAdmitcard.js';
import TemplateMarksheet from '../models/templateMarksheet.js';
import ExamGroupClassBatchExam from '../models/examGroupClassBatchExam.js';
import ExamGroupClassBatchExamSubject from '../models/examGroupClassBatchExamSubject.js';
import ExamGroupClassBatchExamStudent from '../models/examGroupClassBatchExamStudent.js';
import ExamGroupExamResult from '../models/examGroupExamResult.js';
import ExamGroupStudent from '../models/examGroupStudent.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

class ExamRepository {
  // --- Legacy Exam & Scheduling methods ---
  async get(id = null, currentSession = 21) {
    if (id !== null) {
      return await Exam.findByPk(id);
    }
    return await Exam.findAll({
      where: { sesion_id: currentSession },
      order: [['id', 'DESC']]
    });
  }

  async add(examData) {
    if (examData.id) {
      const { id, ...updateData } = examData;
      await Exam.update(updateData, { where: { id } });
      return id;
    }
    const exam = await Exam.create(examData);
    return exam.id;
  }

  async remove(id) {
    return await Exam.destroy({ where: { id } });
  }

  async addSchedule(scheduleData) {
    const existing = await ExamSchedule.findOne({
      where: {
        exam_id: scheduleData.exam_id,
        teacher_subject_id: scheduleData.teacher_subject_id
      }
    });

    if (existing) {
      await ExamSchedule.update(scheduleData, { where: { id: existing.id } });
      return existing.id;
    }
    const schedule = await ExamSchedule.create(scheduleData);
    return schedule.id;
  }

  async getDetailByClsAndSection(classId, sectionId, examId, currentSession = 21) {
    const sql = `
      SELECT exam_schedules.*, subjects.name, subjects.id as subject_id, subjects.type 
      FROM exam_schedules
      INNER JOIN teacher_subjects ON exam_schedules.teacher_subject_id = teacher_subjects.id
      INNER JOIN exams ON exam_schedules.exam_id = exams.id
      INNER JOIN class_sections ON class_sections.id = teacher_subjects.class_section_id
      INNER JOIN subjects ON teacher_subjects.subject_id = subjects.id
      WHERE class_sections.class_id = :classId 
        AND class_sections.section_id = :sectionId 
        AND exam_schedules.exam_id = :examId 
        AND exam_schedules.session_id = :currentSession
    `;
    return await sequelize.query(sql, {
      replacements: { classId, sectionId, examId, currentSession },
      type: QueryTypes.SELECT
    });
  }

  async getExamByClassAndSection(classId, sectionId, currentSession = 21) {
    const sql = `
      SELECT exams.*, exam_schedules.id AS exam_schedule_id, exam_schedules.date_of_exam, exam_schedules.room_no
      FROM exams 
      INNER JOIN (
        SELECT exam_schedules.*, teacher_subjects.class_id, teacher_subjects.section_id 
        FROM exam_schedules 
        INNER JOIN (
          SELECT teacher_subjects.*, class_sections.class_id, class_sections.section_id 
          FROM class_sections
          INNER JOIN teacher_subjects ON teacher_subjects.class_section_id = class_sections.id
          WHERE class_sections.class_id = :classId 
            AND class_sections.section_id = :sectionId 
            AND teacher_subjects.session_id = :currentSession
        ) AS teacher_subjects ON teacher_subjects.id = exam_schedules.teacher_subject_id 
        GROUP BY exam_schedules.exam_id
      ) AS exam_schedules ON exams.id = exam_schedules.exam_id
    `;
    return await sequelize.query(sql, {
      replacements: { classId, sectionId, currentSession },
      type: QueryTypes.SELECT
    });
  }

  // --- Exam Group Methods ---
  async getExamGroups(id = null) {
    if (id !== null) {
      return await ExamGroup.findByPk(id);
    }
    const sql = `
      SELECT eg.*, 
             (SELECT COUNT(*) FROM exam_group_class_batch_exams ecbe WHERE ecbe.exam_group_id = eg.id) as counter
      FROM exam_groups eg
      ORDER BY eg.id DESC
    `;
    return await sequelize.query(sql, {
      type: QueryTypes.SELECT
    });
  }

  async addExamGroup(groupData) {
    if (groupData.id) {
      const { id, ...updateData } = groupData;
      await ExamGroup.update(updateData, { where: { id } });
      return id;
    }
    const group = await ExamGroup.create(groupData);
    return group.id;
  }

  async removeExamGroup(id) {
    return await ExamGroup.destroy({ where: { id } });
  }

  // --- Grade CRUD ---
  async getGrades(id = null) {
    if (id !== null) {
      return await Grade.findByPk(id);
    }
    return await Grade.findAll({ order: [['id', 'DESC']] });
  }

  async saveGrade(gradeData) {
    if (gradeData.id) {
      const { id, ...updateData } = gradeData;
      await Grade.update(updateData, { where: { id } });
      return id;
    }
    const grade = await Grade.create(gradeData);
    return grade.id;
  }

  async deleteGrade(id) {
    return await Grade.destroy({ where: { id } });
  }

  // --- Division CRUD ---
  async getDivisions(id = null) {
    if (id !== null) {
      return await MarkDivision.findByPk(id);
    }
    return await MarkDivision.findAll({ order: [['id', 'DESC']] });
  }

  async saveDivision(divisionData) {
    if (divisionData.id) {
      const { id, ...updateData } = divisionData;
      await MarkDivision.update(updateData, { where: { id } });
      return id;
    }
    const division = await MarkDivision.create(divisionData);
    return division.id;
  }

  async deleteDivision(id) {
    return await MarkDivision.destroy({ where: { id } });
  }

  // --- Template Admitcard CRUD ---
  async getTemplateAdmitcards(id = null) {
    if (id !== null) {
      return await TemplateAdmitcard.findByPk(id);
    }
    return await TemplateAdmitcard.findAll({ order: [['id', 'DESC']] });
  }

  async saveTemplateAdmitcard(templateData) {
    if (templateData.id) {
      const { id, ...updateData } = templateData;
      await TemplateAdmitcard.update(updateData, { where: { id } });
      return id;
    }
    const template = await TemplateAdmitcard.create(templateData);
    return template.id;
  }

  async deleteTemplateAdmitcard(id) {
    return await TemplateAdmitcard.destroy({ where: { id } });
  }

  // --- Template Marksheet CRUD ---
  async getTemplateMarksheets(id = null) {
    if (id !== null) {
      return await TemplateMarksheet.findByPk(id);
    }
    return await TemplateMarksheet.findAll({ order: [['id', 'DESC']] });
  }

  async saveTemplateMarksheet(templateData) {
    if (templateData.id) {
      const { id, ...updateData } = templateData;
      await TemplateMarksheet.update(updateData, { where: { id } });
      return id;
    }
    const template = await TemplateMarksheet.create(templateData);
    return template.id;
  }

  async deleteTemplateMarksheet(id) {
    return await TemplateMarksheet.destroy({ where: { id } });
  }

  // --- Connected Exams (ExamGroupClassBatchExam) ---
  async getExamsByGroupId(groupId) {
    const sql = `
      SELECT ecbe.*, s.session,
             (SELECT COUNT(*) FROM exam_group_class_batch_exam_subjects WHERE exam_group_class_batch_exams_id = ecbe.id) as total_subjects
      FROM exam_group_class_batch_exams ecbe
      INNER JOIN sessions s ON s.id = ecbe.session_id
      WHERE ecbe.exam_group_id = :groupId
      ORDER BY ecbe.id DESC
    `;
    return await sequelize.query(sql, {
      replacements: { groupId },
      type: QueryTypes.SELECT
    });
  }

  async saveExamGroupExam(examData) {
    if (examData.id) {
      const { id, ...updateData } = examData;
      await ExamGroupClassBatchExam.update(updateData, { where: { id } });
      return id;
    }
    const created = await ExamGroupClassBatchExam.create(examData);
    return created.id;
  }

  async deleteExamGroupExam(id) {
    return await ExamGroupClassBatchExam.destroy({ where: { id } });
  }

  // --- Subject Mappings (ExamGroupClassBatchExamSubject) ---
  async getExamSubjects(examGroupExamId) {
    const sql = `
      SELECT 
        egcbes.*,
        sub.name as subject_name,
        sub.code as subject_code,
        sub.type as subject_type
      FROM exam_group_class_batch_exam_subjects egcbes
      INNER JOIN subjects sub ON sub.id = egcbes.subject_id
      WHERE egcbes.exam_group_class_batch_exams_id = :examGroupExamId
      ORDER BY egcbes.id ASC
    `;
    return await sequelize.query(sql, {
      replacements: { examGroupExamId },
      type: QueryTypes.SELECT
    });
  }

  async saveExamSubjects(examGroupExamId, subjects) {
    const transaction = await sequelize.transaction();
    try {
      // Delete old mapping
      await ExamGroupClassBatchExamSubject.destroy({
        where: { exam_group_class_batch_exams_id: examGroupExamId },
        transaction
      });

      // Insert new mapping
      if (subjects && subjects.length > 0) {
        const insertData = subjects.map(s => ({
          exam_group_class_batch_exams_id: examGroupExamId,
          subject_id: s.subject_id,
          date_from: s.date_from,
          time_from: s.time_from,
          duration: s.duration || '1.5 hrs',
          room_no: s.room_no || '',
          max_marks: s.max_marks || 100,
          min_marks: s.min_marks || 33,
          credit_hours: s.credit_hours || 0,
          is_active: 1
        }));
        await ExamGroupClassBatchExamSubject.bulkCreate(insertData, { transaction });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- Student Enrollment (ExamGroupStudent & ExamGroupClassBatchExamStudent) ---
  async getExamGroupStudents(examGroupId, classId, sectionId, sessionId) {
    const sql = `
      SELECT 
        s.id as student_id,
        s.admission_no,
        s.roll_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.image,
        s.father_name,
        s.gender,
        ss.id as student_session_id,
        c.class,
        sec.section,
        egs.id as exam_group_student_id
      FROM student_session ss
      INNER JOIN students s ON s.id = ss.student_id
      INNER JOIN classes c ON c.id = ss.class_id
      INNER JOIN sections sec ON sec.id = ss.section_id
      LEFT JOIN exam_group_students egs ON egs.student_id = s.id AND egs.exam_group_id = :examGroupId
      WHERE ss.class_id = :classId 
        AND ss.section_id = :sectionId 
        AND ss.session_id = :sessionId
        AND s.is_active = 'yes'
      ORDER BY s.firstname ASC
    `;
    return await sequelize.query(sql, {
      replacements: { examGroupId, classId, sectionId, sessionId },
      type: QueryTypes.SELECT
    });
  }

  async saveExamGroupStudents(examGroupId, studentIds, sessionId) {
    const transaction = await sequelize.transaction();
    try {
      // Find currently assigned
      const currentAssigned = await ExamGroupStudent.findAll({
        where: { exam_group_id: examGroupId },
        transaction
      });

      const currentIds = currentAssigned.map(a => a.student_id);

      // Determine additions
      const toAdd = studentIds.filter(id => !currentIds.includes(id));
      // Determine deletions
      const toDelete = currentIds.filter(id => !studentIds.includes(id));

      if (toAdd.length > 0) {
        // Find student sessions
        const sqlSession = `SELECT id, student_id FROM student_session WHERE student_id IN (:toAdd) AND session_id = :sessionId`;
        const sessions = await sequelize.query(sqlSession, {
          replacements: { toAdd, sessionId },
          type: QueryTypes.SELECT,
          transaction
        });

        const insertData = sessions.map(ss => ({
          exam_group_id: examGroupId,
          student_id: ss.student_id,
          student_session_id: ss.id,
          is_active: 1
        }));
        await ExamGroupStudent.bulkCreate(insertData, { transaction });
      }

      if (toDelete.length > 0) {
        await ExamGroupStudent.destroy({
          where: {
            exam_group_id: examGroupId,
            student_id: toDelete
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

  async getEligibleStudentsForExam(examGroupExamId, examGroupId, classId, sectionId, sessionId) {
    const sql = `
      SELECT 
        s.id as student_id,
        s.admission_no,
        s.roll_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.image,
        s.father_name,
        s.gender,
        ss.id as student_session_id,
        egs.id as exam_group_student_id,
        egcbes.id as exam_group_class_batch_exam_student_id,
        egcbes.roll_no as exam_roll_no
      FROM student_session ss
      INNER JOIN students s ON s.id = ss.student_id
      INNER JOIN exam_group_students egs ON egs.student_id = s.id AND egs.exam_group_id = :examGroupId
      LEFT JOIN exam_group_class_batch_exam_students egcbes ON egcbes.student_session_id = ss.id AND egcbes.exam_group_class_batch_exam_id = :examGroupExamId
      WHERE ss.class_id = :classId
        AND ss.section_id = :sectionId
        AND ss.session_id = :sessionId
        AND s.is_active = 'yes'
      ORDER BY s.firstname ASC
    `;
    return await sequelize.query(sql, {
      replacements: { examGroupExamId, examGroupId, classId, sectionId, sessionId },
      type: QueryTypes.SELECT
    });
  }

  async assignStudentsToExam(examGroupExamId, assignments) {
    const transaction = await sequelize.transaction();
    try {
      // Find currently enrolled students in this exam
      const enrolled = await ExamGroupClassBatchExamStudent.findAll({
        where: { exam_group_class_batch_exam_id: examGroupExamId },
        transaction
      });

      const enrolledStudentSessionIds = enrolled.map(e => e.student_session_id);

      const targetStudentSessionIds = assignments.map(a => a.student_session_id);

      // Delete those that are unchecked
      const toDelete = enrolledStudentSessionIds.filter(id => !targetStudentSessionIds.includes(id));
      if (toDelete.length > 0) {
        await ExamGroupClassBatchExamStudent.destroy({
          where: {
            exam_group_class_batch_exam_id: examGroupExamId,
            student_session_id: toDelete
          },
          transaction
        });
      }

      // Add/Update target ones
      for (const assign of assignments) {
        const existing = enrolled.find(e => e.student_session_id === assign.student_session_id);
        if (existing) {
          await ExamGroupClassBatchExamStudent.update({
            roll_no: assign.roll_no || null
          }, {
            where: { id: existing.id },
            transaction
          });
        } else {
          await ExamGroupClassBatchExamStudent.create({
            exam_group_class_batch_exam_id: examGroupExamId,
            student_id: assign.student_id,
            student_session_id: assign.student_session_id,
            roll_no: assign.roll_no || null,
            is_active: 1
          }, { transaction });
        }
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- Marks & Results Management ---
  async getExamSubjectResult(examSubjectId, classId, sectionId, sessionId) {
    const subjectInfo = await ExamGroupClassBatchExamSubject.findByPk(examSubjectId);
    if (!subjectInfo) return [];

    const examGroupExamId = subjectInfo.exam_group_class_batch_exams_id;

    const sql = `
      SELECT 
        s.id as student_id,
        s.admission_no,
        s.roll_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.image,
        s.father_name,
        s.gender,
        egcbes.id as exam_group_class_batch_exam_student_id,
        egcbes.roll_no as exam_roll_no,
        egcber.id as exam_group_exam_result_id,
        egcber.attendence,
        egcber.get_marks,
        egcber.note
      FROM exam_group_class_batch_exam_students egcbes
      INNER JOIN student_session ss ON ss.id = egcbes.student_session_id
      INNER JOIN students s ON s.id = ss.student_id
      LEFT JOIN exam_group_exam_results egcber ON egcber.exam_group_class_batch_exam_student_id = egcbes.id 
        AND egcber.exam_group_class_batch_exam_subject_id = :examSubjectId
      WHERE egcbes.exam_group_class_batch_exam_id = :examGroupExamId
        AND ss.class_id = :classId
        AND ss.section_id = :sectionId
        AND ss.session_id = :sessionId
        AND s.is_active = 'yes'
      ORDER BY CAST(s.admission_no AS UNSIGNED) ASC
    `;
    return await sequelize.query(sql, {
      replacements: { examGroupExamId, examSubjectId, classId, sectionId, sessionId },
      type: QueryTypes.SELECT
    });
  }

  async saveExamResults(results) {
    const transaction = await sequelize.transaction();
    try {
      for (const res of results) {
        const { exam_group_class_batch_exam_student_id, exam_group_class_batch_exam_subject_id, attendence, get_marks, note } = res;
        
        const existing = await ExamGroupExamResult.findOne({
          where: {
            exam_group_class_batch_exam_student_id,
            exam_group_class_batch_exam_subject_id
          },
          transaction
        });

        if (existing) {
          await ExamGroupExamResult.update({
            attendence,
            get_marks,
            note
          }, {
            where: { id: existing.id },
            transaction
          });
        } else {
          // Find the general exam_group_student_id mapping if exists
          const studentInfo = await ExamGroupClassBatchExamStudent.findByPk(exam_group_class_batch_exam_student_id, { transaction });
          const groupExamInfo = await ExamGroupClassBatchExam.findByPk(studentInfo.exam_group_class_batch_exam_id, { transaction });
          
          const egs = await ExamGroupStudent.findOne({
            where: {
              exam_group_id: groupExamInfo.exam_group_id,
              student_id: studentInfo.student_id
            },
            transaction
          });

          await ExamGroupExamResult.create({
            exam_group_class_batch_exam_student_id,
            exam_group_class_batch_exam_subject_id,
            exam_group_student_id: egs ? egs.id : null,
            attendence,
            get_marks,
            note,
            is_active: 1
          }, { transaction });
        }
      }
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateRanks(ranks, examGroupExamId) {
    const transaction = await sequelize.transaction();
    try {
      // Update is_rank_generated to 1
      await ExamGroupClassBatchExam.update(
        { is_rank_generated: 1 },
        { where: { id: examGroupExamId }, transaction }
      );

      // Update student ranks
      for (const row of ranks) {
        await ExamGroupClassBatchExamStudent.update(
          { rank: row.rank },
          { where: { id: row.exam_group_class_batch_exam_student_id }, transaction }
        );
      }
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- Printable Search & Generate methods ---
  async getExamStudents(examGroupExamId, classId, sectionId, sessionId) {
    const sql = `
      SELECT 
        egcbes.id as exam_group_class_batch_exam_student_id,
        egcbes.roll_no as exam_roll_no,
        egcbes.rank,
        egcbes.teacher_remark,
        s.id as student_id,
        s.admission_no,
        s.roll_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.image,
        s.dob,
        s.gender,
        s.father_name,
        s.mother_name,
        s.current_address,
        c.class,
        sec.section
      FROM exam_group_class_batch_exam_students egcbes
      INNER JOIN student_session ss ON ss.id = egcbes.student_session_id
      INNER JOIN students s ON s.id = ss.student_id
      INNER JOIN classes c ON c.id = ss.class_id
      INNER JOIN sections sec ON sec.id = ss.section_id
      WHERE egcbes.exam_group_class_batch_exam_id = :examGroupExamId
        AND ss.class_id = :classId
        AND ss.section_id = :sectionId
        AND ss.session_id = :sessionId
        AND s.is_active = 'yes'
      ORDER BY s.firstname ASC
    `;
    return await sequelize.query(sql, {
      replacements: { examGroupExamId, classId, sectionId, sessionId },
      type: QueryTypes.SELECT
    });
  }

  async getStudentExamResults(examGroupExamId, studentId) {
    const sql = `
      SELECT 
        egcbes.*,
        egcber.id as exam_group_exam_result_id,
        egcber.attendence,
        egcber.get_marks,
        egcber.note,
        sub.name as subject_name,
        sub.code as subject_code,
        sub.type as subject_type
      FROM exam_group_class_batch_exam_subjects egcbes
      INNER JOIN subjects sub ON sub.id = egcbes.subject_id
      LEFT JOIN exam_group_exam_results egcber ON egcber.exam_group_class_batch_exam_subject_id = egcbes.id 
        AND egcber.exam_group_class_batch_exam_student_id = :studentId
      WHERE egcbes.exam_group_class_batch_exams_id = :examGroupExamId
      ORDER BY egcbes.id ASC
    `;
    return await sequelize.query(sql, {
      replacements: { examGroupExamId, studentId },
      type: QueryTypes.SELECT
    });
  }
}

export default ExamRepository;
