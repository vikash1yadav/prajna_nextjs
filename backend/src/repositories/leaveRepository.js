import StudentApplyLeave from '../models/studentApplyLeave.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

class LeaveRepository {
  async getAll(classId = null, sectionId = null, currentSession = 21) {
    let sql = `
      SELECT 
        student_applyleave.*,
        student_applyleave.status AS apply_leave_status,
        students.firstname,
        students.middlename,
        students.lastname,
        staff.employee_id AS staff_id,
        staff.name AS staff_name,
        staff.surname AS staff_surname,
        students.id AS stud_id,
        students.admission_no AS admission_no,
        classes.id AS class_id,
        sections.id AS section_id,
        classes.class,
        sections.section
      FROM student_applyleave
      INNER JOIN student_session ON student_session.id = student_applyleave.student_session_id
      INNER JOIN students ON students.id = student_session.student_id
      LEFT JOIN staff ON staff.id = student_applyleave.approve_by
      INNER JOIN classes ON student_session.class_id = classes.id
      INNER JOIN sections ON student_session.section_id = sections.id
      WHERE students.is_active = 'yes'
        AND student_session.session_id = :currentSession
    `;

    const replacements = { currentSession };

    if (classId) {
      sql += ` AND classes.id = :classId`;
      replacements.classId = classId;
    }

    if (sectionId) {
      sql += ` AND sections.id = :sectionId`;
      replacements.sectionId = sectionId;
    }

    sql += ` ORDER BY student_applyleave.id DESC`;

    return await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    });
  }

  async getById(id) {
    return await StudentApplyLeave.findByPk(id);
  }

  async create(data) {
    return await StudentApplyLeave.create(data);
  }

  async update(id, data) {
    return await StudentApplyLeave.update(data, {
      where: { id }
    });
  }

  async delete(id) {
    return await StudentApplyLeave.destroy({
      where: { id }
    });
  }
}

export default LeaveRepository;
