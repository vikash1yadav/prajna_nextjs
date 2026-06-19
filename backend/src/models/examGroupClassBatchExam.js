import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExamGroupClassBatchExam = sequelize.define('ExamGroupClassBatchExam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  passing_percentage: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_from: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  date_to: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  exam_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  use_exam_roll_no: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_publish: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_rank_generated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
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
  tableName: 'exam_group_class_batch_exams',
  timestamps: false
});

export default ExamGroupClassBatchExam;
