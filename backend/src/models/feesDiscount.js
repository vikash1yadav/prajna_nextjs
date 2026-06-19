import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeesDiscount = sequelize.define('FeesDiscount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  percentage: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  amount: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  discount_limit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  expire_date: {
    type: DataTypes.DATEONLY,
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
  tableName: 'fees_discounts',
  timestamps: false
});

export default FeesDiscount;
