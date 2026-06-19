import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentFeeDeposit = sequelize.define('StudentFeeDeposit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_fees_master_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fee_groups_feetype_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_transport_fee_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  amount_detail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(10),
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
  tableName: 'student_fees_deposite',
  timestamps: false
});

export default StudentFeeDeposit;
