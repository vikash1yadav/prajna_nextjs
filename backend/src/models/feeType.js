import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeeType = sequelize.define('FeeType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  is_system: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  feecategory_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  is_active: {
    type: DataTypes.STRING(255),
    defaultValue: 'no'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nature: {
    type: DataTypes.STRING(255),
    defaultValue: ''
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
  tableName: 'feetype',
  timestamps: false
});

export default FeeType;
