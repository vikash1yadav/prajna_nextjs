import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DispatchReceive = sequelize.define('DispatchReceive', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reference_no: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  to_title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  note: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  from_title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(100),
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
  tableName: 'dispatch_receive',
  timestamps: false
});

export default DispatchReceive;
