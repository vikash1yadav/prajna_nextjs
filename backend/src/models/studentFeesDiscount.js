import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentFeesDiscount = sequelize.define('StudentFeesDiscount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fees_discount_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'assigned'
  },
  payment_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
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
  tableName: 'student_fees_discounts',
  timestamps: false
});

export default StudentFeesDiscount;
