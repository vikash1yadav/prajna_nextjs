import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Visitor = sequelize.define('Visitor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  purpose: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contact: {
    type: DataTypes.STRING(12),
    allowNull: false
  },
  id_proof: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  no_of_people: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  in_time: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  out_time: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  meeting_with: {
    type: DataTypes.STRING(20),
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
  tableName: 'visitors_book',
  timestamps: false
});

export default Visitor;
