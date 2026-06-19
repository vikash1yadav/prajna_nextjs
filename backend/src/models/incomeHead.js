import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const IncomeHead = sequelize.define('IncomeHead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  income_category: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'yes'
  },
  is_deleted: {
    type: DataTypes.STRING(255),
    allowNull: false,
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
  tableName: 'income_head',
  timestamps: false
});

export default IncomeHead;
