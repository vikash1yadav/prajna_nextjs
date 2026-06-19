import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExamGroupClassBatchExamStudent = sequelize.define('ExamGroupClassBatchExamStudent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_group_class_batch_exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roll_no: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  teacher_remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'exam_group_class_batch_exam_students',
  timestamps: false
});

export default ExamGroupClassBatchExamStudent;
