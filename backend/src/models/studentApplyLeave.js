import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentApplyLeave = sequelize.define('StudentApplyLeave', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  from_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  to_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  apply_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // 0 = Pending, 1 = Approved, 2 = Disapproved
  },
  docs: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  approve_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  approve_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  request_type: {
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
  tableName: 'student_applyleave',
  timestamps: false
});

export default StudentApplyLeave;
