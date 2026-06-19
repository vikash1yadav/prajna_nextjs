import Session from '../models/session.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

class SessionRepository {
  async get(id = null) {
    if (id !== null) {
      return await Session.findByPk(id);
    }
    return await Session.findAll({
      order: [['id', 'ASC']]
    });
  }

  async getAllSession() {
    const sql = `
      SELECT sessions.*, IFNULL(sch_settings.session_id, 0) as active 
      FROM sessions 
      LEFT JOIN sch_settings ON sessions.id = sch_settings.session_id
    `;
    return await sequelize.query(sql, { type: QueryTypes.SELECT });
  }

  async getPreSession(sessionId) {
    const sql = `
      SELECT * FROM sessions 
      WHERE id IN (SELECT MAX(id) FROM sessions WHERE id < :sessionId)
    `;
    const result = await sequelize.query(sql, {
      replacements: { sessionId },
      type: QueryTypes.SELECT
    });
    return result.length > 0 ? result[0] : null;
  }

  async getStudentAcademicSession(studentId) {
    const sql = `
      SELECT sessions.* 
      FROM sessions
      INNER JOIN student_session ON sessions.id = student_session.session_id
      WHERE student_session.student_id = :studentId
      GROUP BY student_session.session_id
      ORDER BY sessions.id
    `;
    return await sequelize.query(sql, {
      replacements: { studentId },
      type: QueryTypes.SELECT
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Session.update(updateData, { where: { id } });
      return id;
    } else {
      const session = await Session.create(data);
      return session.id;
    }
  }

  async remove(id) {
    return await Session.destroy({ where: { id } });
  }
}

export default SessionRepository;
