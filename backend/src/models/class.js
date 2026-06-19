import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ClassModel = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  class: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(255),
    defaultValue: 'no'
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
  tableName: 'classes',
  timestamps: false
});

export default ClassModel;
