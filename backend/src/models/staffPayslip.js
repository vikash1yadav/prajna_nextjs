import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StaffPayslip = sequelize.define('StaffPayslip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  basic: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_allowance: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_deduction: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  leave_deduction: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: '0.00'
  },
  net_salary: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'generated'
  },
  month: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  year: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  payment_mode: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  remark: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  generated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  tableName: 'staff_payslip',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default StaffPayslip;
