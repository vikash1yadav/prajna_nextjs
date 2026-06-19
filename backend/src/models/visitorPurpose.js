import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VisitorPurpose = sequelize.define('VisitorPurpose', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  visitors_purpose: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'visitors_purpose',
  timestamps: false
});

export default VisitorPurpose;
