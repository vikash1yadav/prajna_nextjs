import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  is_active: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_system: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_superadmin: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'roles',
  timestamps: false
});

export default Role;
