import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExamGroup = sequelize.define('ExamGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  exam_type: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.INTEGER,
    defaultValue: 1
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
  tableName: 'exam_groups',
  timestamps: false
});

export default ExamGroup;
