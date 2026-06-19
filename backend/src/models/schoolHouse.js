import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SchoolHouse = sequelize.define('SchoolHouse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  house_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(400),
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(50),
    defaultValue: 'yes'
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
  tableName: 'school_houses',
  timestamps: false
});

export default SchoolHouse;
