import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  department_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  is_active: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'yes'
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
  tableName: 'department',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Department;
