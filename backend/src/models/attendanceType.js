import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AttendanceType = sequelize.define('AttendanceType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  key_value: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  long_lang_name: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  long_name_style: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(255),
    defaultValue: 'no'
  },
  for_qr_attendance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  for_schedule: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'attendence_type',
  timestamps: false
});

export default AttendanceType;
