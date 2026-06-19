import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TemplateMarksheet = sequelize.define('TemplateMarksheet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  header_image: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  template: {
    type: DataTypes.STRING(200),
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
  left_sign: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  middle_sign: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  right_sign: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  exam_session: {
    type: DataTypes.INTEGER,
    defaultValue: 1
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
  is_photo: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_division: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_rank: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_customfield: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  background_img: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  date: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_class: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_teacher_remark: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_section: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'template_marksheets',
  timestamps: false
});

export default TemplateMarksheet;
