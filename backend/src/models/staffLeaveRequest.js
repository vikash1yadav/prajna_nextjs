import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffLeaveRequest = sequelize.define('StaffLeaveRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leave_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leave_from: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  leave_to: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  leave_days: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  employee_remark: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  admin_remark: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  approve_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending'
  },
  applied_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  document_file: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'staff_leave_request',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default StaffLeaveRequest;
