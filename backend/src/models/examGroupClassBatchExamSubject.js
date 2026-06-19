import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExamGroupClassBatchExamSubject = sequelize.define('ExamGroupClassBatchExamSubject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_group_class_batch_exams_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_from: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time_from: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  room_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  max_marks: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  min_marks: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  credit_hours: {
    type: DataTypes.FLOAT(10, 2),
    defaultValue: 0.00
  },
  date_to: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'exam_group_class_batch_exam_subjects',
  timestamps: false
});

export default ExamGroupClassBatchExamSubject;
