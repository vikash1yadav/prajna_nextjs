import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubjectTimetable = sequelize.define('SubjectTimetable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  subject_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  subject_group_subject_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  day: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  time_from: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  time_to: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  room_no: {
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
  tableName: 'subject_timetable',
  timestamps: false
});

export default SubjectTimetable;
