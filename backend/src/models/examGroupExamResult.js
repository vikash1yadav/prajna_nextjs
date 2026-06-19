import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExamGroupExamResult = sequelize.define('ExamGroupExamResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_group_class_batch_exam_student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  exam_group_class_batch_exam_subject_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  exam_group_student_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  attendence: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  get_marks: {
    type: DataTypes.FLOAT(10, 2),
    defaultValue: 0.00
  },
  note: {
    type: DataTypes.TEXT,
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
  tableName: 'exam_group_exam_results',
  timestamps: false
});

export default ExamGroupExamResult;
