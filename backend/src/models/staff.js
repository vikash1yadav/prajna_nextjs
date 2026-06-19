import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  lang_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  currency_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  department: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  designation: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  qualification: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  work_exp: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  father_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  mother_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  contact_no: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  emergency_contact_no: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  marital_status: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  date_of_joining: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  date_of_leaving: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  local_address: {
    type: DataTypes.STRING(300),
    allowNull: false,
    defaultValue: ''
  },
  permanent_address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  note: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  image: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  password: {
    type: DataTypes.STRING(250),
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: ''
  },
  account_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  bank_account_no: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  bank_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  ifsc_code: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  bank_branch: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  payscale: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  basic_salary: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  epf_no: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  contract_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  shift: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  facebook: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  twitter: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  linkedin: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  instagram: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  resume: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  joining_letter: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  resignation_letter: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  other_document_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  other_document_file: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  verification_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
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
  tableName: 'staff',
  timestamps: false
});

export default Staff;
