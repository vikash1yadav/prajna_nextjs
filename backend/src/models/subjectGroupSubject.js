import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubjectGroupSubject = sequelize.define('SubjectGroupSubject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  tableName: 'subject_group_subjects',
  timestamps: false
});

export default SubjectGroupSubject;
