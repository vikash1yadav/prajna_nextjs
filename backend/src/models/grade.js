import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_type: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  point: {
    type: DataTypes.FLOAT(10, 1),
    allowNull: true
  },
  mark_from: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  mark_upto: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(255),
    defaultValue: 'no'
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
  tableName: 'grades',
  timestamps: false
});

export default Grade;
