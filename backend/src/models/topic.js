import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // 0 = Incomplete, 1 = Complete
  },
  complete_date: {
    type: DataTypes.DATEONLY,
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
  tableName: 'topic',
  timestamps: false
});

export default Topic;
