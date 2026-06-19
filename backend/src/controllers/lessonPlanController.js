import LessonPlanService from '../services/lessonPlanService.js';

class LessonPlanController {
  constructor() {
    this.service = new LessonPlanService();
  }

  getLessons = async (req, res) => {
    try {
      const { class_section_id, subject_group_subject_id, session_id } = req.query;
      const sessionId = session_id ? parseInt(session_id) : 1;
      const data = await this.service.getLessons(
        parseInt(class_section_id),
        parseInt(subject_group_subject_id),
        sessionId
      );
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  saveLesson = async (req, res) => {
    try {
      const { id, name, subject_group_subject_id, subject_group_class_sections_id, session_id } = req.body;
      const sessionId = session_id ? parseInt(session_id) : 1;
      const data = await this.service.saveLesson(
        id,
        name,
        parseInt(subject_group_subject_id),
        parseInt(subject_group_class_sections_id),
        sessionId
      );
      res.json({ success: true, message: 'Lesson saved successfully', data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  deleteLesson = async (req, res) => {
    try {
      const { id } = req.params;
      await this.service.deleteLesson(parseInt(id));
      res.json({ success: true, message: 'Lesson deleted successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  getTopics = async (req, res) => {
    try {
      const { lesson_id } = req.query;
      const sessionId = req.query.session_id ? parseInt(req.query.session_id) : 1;
      const data = await this.service.getTopics(parseInt(lesson_id), sessionId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  saveTopic = async (req, res) => {
    try {
      const { id, name, lesson_id, status, complete_date, session_id } = req.body;
      const sessionId = session_id ? parseInt(session_id) : 1;
      const data = await this.service.saveTopic(
        id,
        name,
        parseInt(lesson_id),
        status,
        complete_date,
        sessionId
      );
      res.json({ success: true, message: 'Topic saved successfully', data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  deleteTopic = async (req, res) => {
    try {
      const { id } = req.params;
      await this.service.deleteTopic(parseInt(id));
      res.json({ success: true, message: 'Topic deleted successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  getSyllabusStatus = async (req, res) => {
    try {
      const { class_section_id, subject_group_subject_id, session_id } = req.query;
      const sessionId = session_id ? parseInt(session_id) : 1;
      const data = await this.service.getSyllabusStatus(
        parseInt(class_section_id),
        parseInt(subject_group_subject_id),
        sessionId
      );
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  getSyllabusLogs = async (req, res) => {
    try {
      const { topic_id } = req.query;
      const sessionId = req.query.session_id ? parseInt(req.query.session_id) : 1;
      const data = await this.service.getSyllabusLogs(parseInt(topic_id), sessionId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  saveSyllabusLog = async (req, res) => {
    try {
      const {
        id,
        topic_id,
        session_id,
        created_by,
        created_for,
        date,
        time_from,
        time_to,
        presentation,
        attachment,
        lacture_youtube_url,
        lacture_video,
        sub_topic,
        teaching_method,
        general_objectives,
        previous_knowledge,
        comprehensive_questions,
        status
      } = req.body;

      const logData = {
        id,
        topic_id: parseInt(topic_id),
        session_id: session_id ? parseInt(session_id) : 1,
        created_by: parseInt(created_by),
        created_for: parseInt(created_for),
        date,
        time_from,
        time_to,
        presentation,
        attachment,
        lacture_youtube_url,
        lacture_video,
        sub_topic,
        teaching_method,
        general_objectives,
        previous_knowledge,
        comprehensive_questions,
        status: status ? parseInt(status) : 0
      };

      const data = await this.service.saveSyllabusLog(logData);
      res.json({ success: true, message: 'Syllabus log saved successfully', data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  deleteSyllabusLog = async (req, res) => {
    try {
      const { id } = req.params;
      await this.service.deleteSyllabusLog(parseInt(id));
      res.json({ success: true, message: 'Syllabus log deleted successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  copyOldLessons = async (req, res) => {
    try {
      const {
        from_class_section_id,
        from_subject_group_subject_id,
        to_class_section_id,
        to_subject_group_subject_id,
        from_session_id,
        to_session_id
      } = req.body;

      const data = await this.service.copyOldLessons(
        parseInt(from_class_section_id),
        parseInt(from_subject_group_subject_id),
        parseInt(to_class_section_id),
        parseInt(to_subject_group_subject_id),
        parseInt(from_session_id),
        parseInt(to_session_id)
      );
      res.json({ success: true, message: `Copied ${data.length} lessons and their topics successfully`, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}

export default LessonPlanController;
