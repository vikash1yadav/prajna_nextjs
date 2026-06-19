import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FeeSessionGroup = sequelize.define('FeeSessionGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fee_groups_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  session_id: {
    type: DataTypes.INTEGER,
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
  tableName: 'fee_session_groups',
  timestamps: false
});

export default FeeSessionGroup;
