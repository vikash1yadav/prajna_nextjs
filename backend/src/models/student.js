import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  admission_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  roll_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  admission_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  firstname: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  middlename: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  lastname: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  rte: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  mobileno: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  religion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cast: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  current_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permanent_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  school_house_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  blood_group: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  hostel_room_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  adhar_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  samagra_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bank_account_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ifsc_code: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  guardian_is: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  father_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  father_phone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  father_occupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  mother_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  mother_phone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  mother_occupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  guardian_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  guardian_relation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  guardian_phone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  guardian_occupation: {
    type: DataTypes.STRING(150),
    allowNull: false,
    defaultValue: ''
  },
  guardian_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  guardian_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  father_pic: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  mother_pic: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  guardian_pic: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  is_active: {
    type: DataTypes.STRING(255),
    defaultValue: 'yes'
  },
  previous_school: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  height: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  weight: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  measurement_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  dis_reason: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  note: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  dis_note: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ''
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  designation: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  app_key: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_app_key: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  disable_at: {
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
  tableName: 'students',
  timestamps: false
});

export default Student;
