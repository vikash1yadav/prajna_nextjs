import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubjectGroupClassSection = sequelize.define('SubjectGroupClassSection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  class_section_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
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
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subject_group_class_sections',
  timestamps: false
});

export default SubjectGroupClassSection;
