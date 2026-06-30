import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffDesignation = sequelize.define('StaffDesignation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  designation: {
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
  tableName: 'staff_designation',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default StaffDesignation;
