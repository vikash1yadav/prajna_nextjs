import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CumulativeFine = sequelize.define('CumulativeFine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  overdue_day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fine_amount: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false
  },
  fee_groups_feetype_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fee_session_group_id: {
    type: DataTypes.INTEGER,
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
  tableName: 'cumulative_fine',
  timestamps: false
});

export default CumulativeFine;
