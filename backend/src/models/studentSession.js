import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentSession = sequelize.define('StudentSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_id: {
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
  hostel_room_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  vehroute_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  route_pickup_point_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transport_fees: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  fees_discount: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  is_leave: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.STRING(255),
    defaultValue: 'no'
  },
  is_alumni: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  default_login: {
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
  tableName: 'student_session',
  timestamps: false
});

export default StudentSession;
