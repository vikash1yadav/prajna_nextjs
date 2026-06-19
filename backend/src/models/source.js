import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Source = sequelize.define('Source', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'source',
  timestamps: false
});

export default Source;
