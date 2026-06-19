import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeesReminder = sequelize.define('FeesReminder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reminder_type: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  day: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'fees_reminder',
  timestamps: false
});

export default FeesReminder;
