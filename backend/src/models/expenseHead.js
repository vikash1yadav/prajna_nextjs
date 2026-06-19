import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExpenseHead = sequelize.define('ExpenseHead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exp_category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'yes'
  },
  is_deleted: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'no'
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
  tableName: 'expense_head',
  timestamps: false
});

export default ExpenseHead;
