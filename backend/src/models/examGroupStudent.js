import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExamGroupStudent = sequelize.define('ExamGroupStudent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_session_id: {
    type: DataTypes.INTEGER,
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
  tableName: 'exam_group_students',
  timestamps: false
});

export default ExamGroupStudent;
