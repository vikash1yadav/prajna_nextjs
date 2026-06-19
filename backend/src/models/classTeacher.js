import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ClassTeacher = sequelize.define('ClassTeacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'class_teacher',
  timestamps: false
});

export default ClassTeacher;
