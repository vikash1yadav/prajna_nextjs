import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveType = sequelize.define('LeaveType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true
  },
  is_active: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'yes'
  }
}, {
  tableName: 'leave_types',
  timestamps: false
});

export default LeaveType;
