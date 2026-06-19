import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentFeeMaster = sequelize.define('StudentFeeMaster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  is_system: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fee_session_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  amount: {
    type: DataTypes.FLOAT(10, 2),
    defaultValue: 0.00
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
  tableName: 'student_fees_master',
  timestamps: false
});

export default StudentFeeMaster;
