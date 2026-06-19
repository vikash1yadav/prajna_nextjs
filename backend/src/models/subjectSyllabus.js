import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubjectSyllabus = sequelize.define('SubjectSyllabus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  topic_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_for: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time_from: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  time_to: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  presentation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lacture_youtube_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  lacture_video: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sub_topic: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  teaching_method: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  general_objectives: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  previous_knowledge: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  comprehensive_questions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subject_syllabus',
  timestamps: false
});

export default SubjectSyllabus;
