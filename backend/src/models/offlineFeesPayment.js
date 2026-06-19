import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OfflineFeesPayment = sequelize.define('OfflineFeesPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  student_session_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_fees_master_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fee_groups_feetype_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  student_transport_fee_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  bank_from: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  bank_account_transferred: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  amount: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: true
  },
  submit_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approve_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  attachment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: DataTypes.STRING(1),
    defaultValue: '0'
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
  tableName: 'offline_fees_payments',
  timestamps: false
});

export default OfflineFeesPayment;
