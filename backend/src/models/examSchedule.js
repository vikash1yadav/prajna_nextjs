import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExamSchedule = sequelize.define('ExamSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  teacher_subject_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date_of_exam: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  start_to: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  end_from: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  room_no: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  full_marks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  passing_marks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(255),
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
  tableName: 'exam_schedules',
  timestamps: false
});

export default ExamSchedule;
