import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeeGroupsFeeType = sequelize.define('FeeGroupsFeeType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fee_session_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fee_groups_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  feetype_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  fine_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'none'
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fine_percentage: {
    type: DataTypes.FLOAT(10, 2),
    defaultValue: 0.00
  },
  fine_amount: {
    type: DataTypes.FLOAT(10, 2),
    defaultValue: 0.00
  },
  fine_per_day: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'fee_groups_feetype',
  timestamps: false
});

export default FeeGroupsFeeType;
