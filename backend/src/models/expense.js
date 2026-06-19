import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exp_head_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  invoice_no: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  amount: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  documents: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  note: {
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
  tableName: 'expenses',
  timestamps: false
});

export default Expense;
