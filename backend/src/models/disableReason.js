import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DisableReason = sequelize.define('DisableReason', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false
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
  tableName: 'disable_reason',
  timestamps: false
});

export default DisableReason;
