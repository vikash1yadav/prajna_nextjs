import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import ClassSection from './classSection.js';

const OnlineAdmission = sequelize.define('OnlineAdmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reference_no: {
    type: DataTypes.STRING(100),
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
  class_section_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: ClassSection,
      key: 'id'
    }
  },
  mobileno: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
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
  category_id: {
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
  guardian_email: {
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
  is_enroll: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  },
  form_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  },
  paid_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  },
  submit_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  document: {
    type: DataTypes.STRING(200),
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
  tableName: 'online_admissions',
  timestamps: false
});

export default OnlineAdmission;
