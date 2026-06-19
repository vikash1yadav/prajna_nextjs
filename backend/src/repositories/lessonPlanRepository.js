import sequelize from '../config/database.js';
import Lesson from '../models/lesson.js';
import Topic from '../models/topic.js';
import SubjectSyllabus from '../models/subjectSyllabus.js';

class LessonPlanRepository {
  // -------------------------------------------------------------
  // Lessons
  // -------------------------------------------------------------
  async getLessons(classSectionId, subjectGroupSubjectId, sessionId) {
    const query = `
      SELECT l.*, 
             sgs.subject_id, sub.name as subject_name, sub.code as subject_code
      FROM lesson l
      INNER JOIN subject_group_subjects sgs ON l.subject_group_subject_id = sgs.id
      INNER JOIN subjects sub ON sgs.subject_id = sub.id
      WHERE l.subject_group_class_sections_id = :classSectionId
        AND l.subject_group_subject_id = :subjectGroupSubjectId
        AND l.session_id = :sessionId
    `;
    return await sequelize.query(query, {
      replacements: { classSectionId, subjectGroupSubjectId, sessionId },
      type: sequelize.QueryTypes.SELECT
    });
  }

  async saveLesson(id, name, subjectGroupSubjectId, subjectGroupClassSectionsId, sessionId) {
    if (id) {
      const lesson = await Lesson.findByPk(id);
      if (!lesson) throw new Error('Lesson not found');
      lesson.name = name;
      await lesson.save();
      return lesson;
    } else {
      return await Lesson.create({
        name,
        subject_group_subject_id: subjectGroupSubjectId,
        subject_group_class_sections_id: subjectGroupClassSectionsId,
        session_id: sessionId
      });
    }
  }

  async deleteLesson(id) {
    const transaction = await sequelize.transaction();
    try {
      // Delete associated topics and syllabus logs first
      const topics = await Topic.findAll({ where: { lesson_id: id }, transaction });
      const topicIds = topics.map(t => t.id);
      if (topicIds.length > 0) {
        await SubjectSyllabus.destroy({ where: { topic_id: topicIds }, transaction });
        await Topic.destroy({ where: { lesson_id: id }, transaction });
      }
      const deleted = await Lesson.destroy({ where: { id }, transaction });
      await transaction.commit();
      return deleted > 0;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // -------------------------------------------------------------
  // Topics
  // -------------------------------------------------------------
  async getTopics(lessonId, sessionId) {
    return await Topic.findAll({
      where: { lesson_id: lessonId, session_id: sessionId },
      order: [['id', 'ASC']]
    });
  }

  async saveTopic(id, name, lessonId, status, completeDate, sessionId) {
    if (id) {
      const topic = await Topic.findByPk(id);
      if (!topic) throw new Error('Topic not found');
      topic.name = name;
      topic.status = status !== undefined ? status : topic.status;
      topic.complete_date = completeDate !== undefined ? completeDate : topic.complete_date;
      await topic.save();
      return topic;
    } else {
      return await Topic.create({
        name,
        lesson_id: lessonId,
        status: status || 0,
        complete_date: completeDate || null,
        session_id: sessionId
      });
    }
  }

  async deleteTopic(id) {
    const transaction = await sequelize.transaction();
    try {
      await SubjectSyllabus.destroy({ where: { topic_id: id }, transaction });
      const deleted = await Topic.destroy({ where: { id }, transaction });
      await transaction.commit();
      return deleted > 0;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // -------------------------------------------------------------
  // Syllabus Status
  // -------------------------------------------------------------
  async getSyllabusStatus(classSectionId, subjectGroupSubjectId, sessionId) {
    const query = `
      SELECT l.id as lesson_id, l.name as lesson_name,
             t.id as topic_id, t.name as topic_name, t.status as topic_status, t.complete_date
      FROM lesson l
      LEFT JOIN topic t ON l.id = t.lesson_id AND t.session_id = :sessionId
      WHERE l.subject_group_class_sections_id = :classSectionId
        AND l.subject_group_subject_id = :subjectGroupSubjectId
        AND l.session_id = :sessionId
    `;
    const results = await sequelize.query(query, {
      replacements: { classSectionId, subjectGroupSubjectId, sessionId },
      type: sequelize.QueryTypes.SELECT
    });

    const lessonsMap = {};
    for (const row of results) {
      if (!lessonsMap[row.lesson_id]) {
        lessonsMap[row.lesson_id] = {
          lesson_id: row.lesson_id,
          lesson_name: row.lesson_name,
          topics: []
        };
      }
      if (row.topic_id) {
        lessonsMap[row.lesson_id].topics.push({
          topic_id: row.topic_id,
          topic_name: row.topic_name,
          status: row.topic_status,
          complete_date: row.complete_date
        });
      }
    }

    return Object.values(lessonsMap);
  }

  // -------------------------------------------------------------
  // Daily Syllabus Logs (Subject Syllabus)
  // -------------------------------------------------------------
  async getSyllabusLogs(topicId, sessionId) {
    const query = `
      SELECT ss.*, staff.name as staff_name, staff.surname as staff_surname
      FROM subject_syllabus ss
      LEFT JOIN staff ON ss.created_by = staff.id
      WHERE ss.topic_id = :topicId AND ss.session_id = :sessionId
      ORDER BY ss.date DESC, ss.id DESC
    `;
    return await sequelize.query(query, {
      replacements: { topicId, sessionId },
      type: sequelize.QueryTypes.SELECT
    });
  }

  async saveSyllabusLog(logData) {
    if (logData.id) {
      const log = await SubjectSyllabus.findByPk(logData.id);
      if (!log) throw new Error('Syllabus log not found');
      Object.assign(log, logData);
      await log.save();
      return log;
    } else {
      return await SubjectSyllabus.create(logData);
    }
  }

  async deleteSyllabusLog(id) {
    const deleted = await SubjectSyllabus.destroy({ where: { id } });
    return deleted > 0;
  }

  // -------------------------------------------------------------
  // Copy Old Lessons
  // -------------------------------------------------------------
  async copyOldLessons(fromClassSectionId, fromSubjectGroupSubjectId, toClassSectionId, toSubjectGroupSubjectId, fromSessionId, toSessionId) {
    const transaction = await sequelize.transaction();
    try {
      // Find old lessons
      const oldLessons = await Lesson.findAll({
        where: {
          subject_group_class_sections_id: fromClassSectionId,
          subject_group_subject_id: fromSubjectGroupSubjectId,
          session_id: fromSessionId
        },
        transaction
      });

      const copied = [];

      for (const oldLesson of oldLessons) {
        // Create new lesson in the toSession
        const newLesson = await Lesson.create({
          name: oldLesson.name,
          subject_group_class_sections_id: toClassSectionId,
          subject_group_subject_id: toSubjectGroupSubjectId,
          session_id: toSessionId
        }, { transaction });

        // Find old topics associated with this old lesson
        const oldTopics = await Topic.findAll({
          where: {
            lesson_id: oldLesson.id,
            session_id: fromSessionId
          },
          transaction
        });

        if (oldTopics.length > 0) {
          const newTopicsData = oldTopics.map(ot => ({
            name: ot.name,
            lesson_id: newLesson.id,
            status: 0, // reset status to incomplete
            session_id: toSessionId
          }));
          await Topic.bulkCreate(newTopicsData, { transaction });
        }

        copied.push(newLesson);
      }

      await transaction.commit();
      return copied;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

export default LessonPlanRepository;
