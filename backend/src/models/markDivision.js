import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MarkDivision = sequelize.define('MarkDivision', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  percentage_from: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  percentage_to: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  is_active: {
    type: DataTypes.INTEGER,
    defaultValue: 1
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
  tableName: 'mark_divisions',
  timestamps: false
});

export default MarkDivision;
