import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TemplateAdmitcard = sequelize.define('TemplateAdmitcard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  template: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  heading: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  left_logo: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  right_logo: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  exam_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  school_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  exam_center: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  sign: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  background_img: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  is_name: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_father_name: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_mother_name: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_dob: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_admission_no: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_roll_no: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_address: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_gender: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_photo: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_class: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_section: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  content_footer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'template_admitcards',
  timestamps: false
});

export default TemplateAdmitcard;
