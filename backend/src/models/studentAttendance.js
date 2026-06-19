import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentAttendance = sequelize.define('StudentAttendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  biometric_attendence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  qrcode_attendance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  attendence_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  remark: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  biometric_device_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING(250),
    allowNull: true
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
  tableName: 'student_attendences',
  timestamps: false
});

export default StudentAttendance;
