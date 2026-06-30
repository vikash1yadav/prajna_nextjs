import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffAttendance = sequelize.define('StaffAttendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  staff_attendance_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  remark: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  in_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  out_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  is_active: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
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
  tableName: 'staff_attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default StaffAttendance;
