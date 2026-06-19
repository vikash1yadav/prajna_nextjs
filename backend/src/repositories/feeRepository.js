import FeeType from '../models/feeType.js';
import FeeGroup from '../models/feeGroup.js';
import FeeMaster from '../models/feeMaster.js';
import StudentFeeMaster from '../models/studentFeeMaster.js';
import StudentFeeDeposit from '../models/studentFeeDeposit.js';
import FeeSessionGroup from '../models/feeSessionGroup.js';
import FeeGroupsFeeType from '../models/feeGroupsFeeType.js';
import CumulativeFine from '../models/cumulativeFine.js';
import FeesDiscount from '../models/feesDiscount.js';
import StudentFeesDiscount from '../models/studentFeesDiscount.js';
import FeesReminder from '../models/feesReminder.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

class FeeRepository {
  // --- Fee Types CRUD ---
  async getFeeTypes() {
    return await FeeType.findAll({ order: [['id', 'ASC']] });
  }

  async saveFeeType(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await FeeType.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await FeeType.create(data);
      return record.id;
    }
  }

  async deleteFeeType(id) {
    return await FeeType.destroy({ where: { id } });
  }

  // --- Fee Groups CRUD ---
  async getFeeGroups() {
    return await FeeGroup.findAll({ order: [['id', 'ASC']] });
  }

  async saveFeeGroup(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await FeeGroup.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await FeeGroup.create(data);
      return record.id;
    }
  }

  async deleteFeeGroup(id) {
    return await FeeGroup.destroy({ where: { id } });
  }

  // --- Fees Master CRUD (Targets fee_groups_feetype, fee_session_groups, cumulative_fine) ---
  async getFeeMasters(classId = null, currentSession = 21) {
    const sql = `
      SELECT fgf.*, 
             fg.name AS fee_group_name, 
             ft.type AS fee_type_name, 
             ft.code AS fee_type_code 
      FROM fee_groups_feetype fgf
      INNER JOIN fee_session_groups fsg ON fsg.id = fgf.fee_session_group_id
      INNER JOIN fee_groups fg ON fg.id = fgf.fee_groups_id
      INNER JOIN feetype ft ON ft.id = fgf.feetype_id
      WHERE fgf.session_id = :currentSession
      ORDER BY fgf.id DESC
    `;
    const feeMasters = await sequelize.query(sql, {
      replacements: { currentSession },
      type: QueryTypes.SELECT
    });

    for (const fm of feeMasters) {
      if (fm.fine_type === 'cumulative') {
        const finesSql = `
          SELECT * FROM cumulative_fine 
          WHERE fee_groups_feetype_id = :feeGroupsFeeTypeId
          ORDER BY overdue_day ASC
        `;
        fm.cumulative_fines = await sequelize.query(finesSql, {
          replacements: { feeGroupsFeeTypeId: fm.id },
          type: QueryTypes.SELECT
        });
      } else {
        fm.cumulative_fines = [];
      }
    }
    return feeMasters;
  }

  async saveFeeMaster(data, currentSession = 21) {
    const t = await sequelize.transaction();
    try {
      let sessionGroup = await FeeSessionGroup.findOne({
        where: {
          fee_groups_id: data.fee_groups_id,
          session_id: currentSession
        },
        transaction: t
      });

      if (!sessionGroup) {
        sessionGroup = await FeeSessionGroup.create({
          fee_groups_id: data.fee_groups_id,
          session_id: currentSession,
          is_active: 'no'
        }, { transaction: t });
      }

      let feeGroupsFeeTypeRecordId;
      if (data.id) {
        await FeeGroupsFeeType.update({
          fee_session_group_id: sessionGroup.id,
          fee_groups_id: data.fee_groups_id,
          feetype_id: data.feetype_id,
          session_id: currentSession,
          amount: data.amount,
          fine_type: data.fine_type || 'none',
          due_date: data.due_date,
          fine_percentage: data.fine_percentage || 0,
          fine_amount: data.fine_amount || 0,
          fine_per_day: data.fine_per_day || 0
        }, {
          where: { id: data.id },
          transaction: t
        });
        feeGroupsFeeTypeRecordId = data.id;
      } else {
        const record = await FeeGroupsFeeType.create({
          fee_session_group_id: sessionGroup.id,
          fee_groups_id: data.fee_groups_id,
          feetype_id: data.feetype_id,
          session_id: currentSession,
          amount: data.amount,
          fine_type: data.fine_type || 'none',
          due_date: data.due_date,
          fine_percentage: data.fine_percentage || 0,
          fine_amount: data.fine_amount || 0,
          fine_per_day: data.fine_per_day || 0,
          is_active: 'no'
        }, { transaction: t });
        feeGroupsFeeTypeRecordId = record.id;
      }

      await CumulativeFine.destroy({
        where: { fee_groups_feetype_id: feeGroupsFeeTypeRecordId },
        transaction: t
      });

      if (data.fine_type === 'cumulative' && Array.isArray(data.cumulative_fines)) {
        for (const fine of data.cumulative_fines) {
          await CumulativeFine.create({
            overdue_day: parseInt(fine.overdue_day),
            fine_amount: parseFloat(fine.fine_amount),
            fee_groups_feetype_id: feeGroupsFeeTypeRecordId,
            fee_session_group_id: sessionGroup.id
          }, { transaction: t });
        }
      }

      await t.commit();
      return feeGroupsFeeTypeRecordId;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deleteFeeMaster(id) {
    const t = await sequelize.transaction();
    try {
      await CumulativeFine.destroy({
        where: { fee_groups_feetype_id: id },
        transaction: t
      });
      await FeeGroupsFeeType.destroy({
        where: { id },
        transaction: t
      });
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- Fees Discount CRUD & Allotment ---
  async getDiscounts(currentSession = 21) {
    return await FeesDiscount.findAll({
      where: { session_id: currentSession },
      order: [['id', 'DESC']]
    });
  }

  async saveDiscount(data, currentSession = 21) {
    if (data.id) {
      const { id, ...updateData } = data;
      await FeesDiscount.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await FeesDiscount.create({ ...data, session_id: currentSession });
      return record.id;
    }
  }

  async deleteDiscount(id) {
    return await FeesDiscount.destroy({ where: { id } });
  }

  async searchAssignDiscountStudents(classId, sectionId, discountId, categoryId = null, gender = null, rteStatus = null, currentSession = 21) {
    const conditions = [];
    const replacements = { currentSession, discountId };

    if (classId) {
      conditions.push('AND student_session.class_id = :classId');
      replacements.classId = classId;
    }
    if (sectionId) {
      conditions.push('AND student_session.section_id = :sectionId');
      replacements.sectionId = sectionId;
    }
    if (categoryId) {
      conditions.push('AND students.category_id = :categoryId');
      replacements.categoryId = categoryId;
    }
    if (gender) {
      conditions.push('AND students.gender = :gender');
      replacements.gender = gender;
    }
    if (rteStatus) {
      conditions.push('AND students.rte = :rteStatus');
      replacements.rteStatus = rteStatus;
    }

    const sql = `
      SELECT IFNULL(student_fees_discounts.id, 0) as student_fees_discount_id,
             classes.id AS class_id,
             student_session.id as student_session_id,
             students.id as student_id,
             classes.class,
             sections.id AS section_id,
             sections.section,
             students.admission_no,
             students.roll_no,
             students.firstname,
             students.middlename,
             students.lastname,
             students.guardian_name,
             students.guardian_phone,
             students.father_name,
             students.gender,
             students.rte
      FROM students
      INNER JOIN student_session ON student_session.student_id = students.id
      INNER JOIN classes ON student_session.class_id = classes.id
      INNER JOIN sections ON sections.id = student_session.section_id
      LEFT JOIN student_fees_discounts ON student_fees_discounts.student_session_id = student_session.id
                                     AND student_fees_discounts.fees_discount_id = :discountId
      WHERE student_session.session_id = :currentSession
        AND students.is_active = 'yes'
        ${conditions.join(' ')}
      ORDER BY students.id
    `;

    return await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    });
  }

  async allotDiscount(discountId, studentSessionIds, studentList) {
    const t = await sequelize.transaction();
    try {
      for (const studentSessionId of studentSessionIds) {
        const exists = await StudentFeesDiscount.findOne({
          where: {
            student_session_id: studentSessionId,
            fees_discount_id: discountId
          },
          transaction: t
        });
        if (!exists) {
          await StudentFeesDiscount.create({
            student_session_id: studentSessionId,
            fees_discount_id: discountId,
            status: 'assigned',
            is_active: 'no'
          }, { transaction: t });
        }
      }

      const diff = studentList.filter(id => !studentSessionIds.includes(id));
      if (diff.length > 0) {
        await StudentFeesDiscount.destroy({
          where: {
            fees_discount_id: discountId,
            student_session_id: diff
          },
          transaction: t
        });
      }

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async applyDiscount(studentFeesDiscountId, paymentId, description) {
    await StudentFeesDiscount.update({
      payment_id: paymentId,
      description: description,
      status: 'applied'
    }, {
      where: { id: studentFeesDiscountId }
    });
    return true;
  }

  // --- Fees Reminder Settings ---
  async getReminders() {
    return await FeesReminder.findAll({ order: [['id', 'ASC']] });
  }

  async updateRemindersBatch(reminders) {
    const t = await sequelize.transaction();
    try {
      for (const r of reminders) {
        await FeesReminder.update({
          day: parseInt(r.day),
          is_active: parseInt(r.is_active)
        }, {
          where: { id: r.id },
          transaction: t
        });
      }
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- Existing Desk Methods ---
  async getDueFeeByFeeSessionGroup(feeSessionGroupId, studentFeesMasterId) {
    const sql = `
      SELECT student_fees_master.*, 
             fee_groups_feetype.fine_type, 
             fee_groups_feetype.id as fee_groups_feetype_id, 
             fee_groups_feetype.amount, 
             fee_groups_feetype.due_date, 
             fee_groups_feetype.fine_amount, 
             fee_groups_feetype.fee_groups_id, 
             fee_groups.name AS fee_group_name, 
             fee_groups_feetype.feetype_id, 
             feetype.code, 
             feetype.type, 
             IFNULL(student_fees_deposite.id, 0) as student_fees_deposite_id, 
             IFNULL(student_fees_deposite.amount_detail, '0') as amount_detail 
      FROM student_fees_master 
      INNER JOIN fee_session_groups ON fee_session_groups.id = student_fees_master.fee_session_group_id 
      INNER JOIN fee_groups_feetype ON fee_groups_feetype.fee_session_group_id = fee_session_groups.id  
      INNER JOIN fee_groups ON fee_groups.id = fee_groups_feetype.fee_groups_id 
      INNER JOIN feetype ON feetype.id = fee_groups_feetype.feetype_id 
      LEFT JOIN student_fees_deposite ON student_fees_deposite.student_fees_master_id = student_fees_master.id 
                                     AND student_fees_deposite.fee_groups_feetype_id = fee_groups_feetype.id 
      WHERE student_fees_master.fee_session_group_id = :feeSessionGroupId 
        AND student_fees_master.id = :studentFeesMasterId 
      ORDER BY feetype.id ASC
    `;
    return await sequelize.query(sql, {
      replacements: { feeSessionGroupId, studentFeesMasterId },
      type: QueryTypes.SELECT
    });
  }

  async getStudentFeesByClassSectionStudent(classId = null, sectionId = null, studentId = null, currentSession = 21) {
    const conditions = [];
    const replacements = { currentSession };

    if (classId !== null) {
      conditions.push('AND student_session.class_id = :classId');
      replacements.classId = classId;
    }
    if (sectionId !== null) {
      conditions.push('AND student_session.section_id = :sectionId');
      replacements.sectionId = sectionId;
    }
    if (studentId !== null) {
      conditions.push('AND student_session.student_id = :studentId');
      replacements.studentId = studentId;
    }

    const sql = `
      SELECT student_fees_master.*, 
             student_session.id as student_session_id, 
             students.firstname, 
             students.middlename, 
             students.lastname, 
             student_session.class_id, 
             classes.class, 
             sections.section, 
             students.category_id, 
             students.image, 
             students.id as student_id, 
             students.father_name, 
             students.admission_no, 
             students.mobileno, 
             students.roll_no, 
             students.rte, 
             IFNULL(categories.category, '') as category 
      FROM student_fees_master 
      INNER JOIN student_session ON student_session.id = student_fees_master.student_session_id 
      INNER JOIN students ON students.id = student_session.student_id 
      INNER JOIN classes ON classes.id = student_session.class_id 
      LEFT JOIN categories ON students.category_id = categories.id 
      INNER JOIN sections ON sections.id = student_session.section_id  
      WHERE student_session.session_id = :currentSession
      ${conditions.join(' ')}
    `;

    const results = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    });

    const studentFees = {};
    for (const row of results) {
      const feeSessionGroupId = row.fee_session_group_id;
      const studentFeesMasterId = row.id;

      const fees = await this.getDueFeeByFeeSessionGroup(feeSessionGroupId, studentFeesMasterId);

      if (row.is_system !== 0 && fees.length > 0) {
        fees[0].amount = row.amount;
      }

      if (!studentFees[row.student_session_id]) {
        studentFees[row.student_session_id] = {
          student_session_id: row.student_session_id,
          firstname: row.firstname,
          student_id: row.student_id,
          middlename: row.middlename,
          lastname: row.lastname,
          class_id: row.class_id,
          class: row.class,
          section: row.section,
          father_name: row.father_name,
          admission_no: row.admission_no,
          mobileno: row.mobileno,
          roll_no: row.roll_no,
          category_id: row.category_id,
          category: row.category,
          rte: row.rte,
          image: row.image,
          fees: []
        };
      }
      studentFees[row.student_session_id].fees.push(fees);
    }

    return Object.values(studentFees);
  }

  async feeDeposit(data) {
    const existing = await StudentFeeDeposit.findOne({
      where: {
        student_fees_master_id: data.student_fees_master_id,
        fee_groups_feetype_id: data.fee_groups_feetype_id
      }
    });

    if (existing) {
      let amountDetailObj = {};
      try {
        amountDetailObj = JSON.parse(existing.amount_detail);
      } catch (e) {
        amountDetailObj = {};
      }

      const keys = Object.keys(amountDetailObj).map(Number);
      const nextInvNo = keys.length > 0 ? Math.max(...keys) + 1 : 1;

      const newTx = {
        amount: parseFloat(data.amount),
        amount_discount: parseFloat(data.amount_discount || 0),
        amount_fine: parseFloat(data.amount_fine || 0),
        date: data.date,
        description: data.description || '',
        payment_mode: data.payment_mode || 'Cash',
        received_by: String(data.received_by || 1),
        inv_no: nextInvNo
      };

      amountDetailObj[nextInvNo] = newTx;
      await StudentFeeDeposit.update({
        amount_detail: JSON.stringify(amountDetailObj)
      }, {
        where: { id: existing.id }
      });

      return { invoice_id: existing.id, sub_invoice_id: nextInvNo };
    } else {
      const newTx = {
        amount: parseFloat(data.amount),
        amount_discount: parseFloat(data.amount_discount || 0),
        amount_fine: parseFloat(data.amount_fine || 0),
        date: data.date,
        description: data.description || '',
        payment_mode: data.payment_mode || 'Cash',
        received_by: String(data.received_by || 1),
        inv_no: 1
      };

      const deposit = await StudentFeeDeposit.create({
        student_fees_master_id: data.student_fees_master_id,
        fee_groups_feetype_id: data.fee_groups_feetype_id,
        amount_detail: JSON.stringify({ "1": newTx })
      });

      return { invoice_id: deposit.id, sub_invoice_id: 1 };
    }
  }

  async getFeeDeposits(studentSessionId) {
    const sql = `
      SELECT student_fees_deposite.*,
             fee_groups.name AS fee_group_name,
             feetype.type AS fee_type_name,
             feetype.code AS fee_type_code
      FROM student_fees_deposite
      INNER JOIN student_fees_master ON student_fees_deposite.student_fees_master_id = student_fees_master.id
      INNER JOIN fee_groups_feetype ON student_fees_deposite.fee_groups_feetype_id = fee_groups_feetype.id
      INNER JOIN fee_groups ON fee_groups_feetype.fee_groups_id = fee_groups.id
      INNER JOIN feetype ON fee_groups_feetype.feetype_id = feetype.id
      WHERE student_fees_master.student_session_id = :studentSessionId
    `;
    return await sequelize.query(sql, {
      replacements: { studentSessionId },
      type: QueryTypes.SELECT
    });
  }

  // --- Offline Bank Payments ---
  async getOfflinePayments() {
    const sql = `
      SELECT ofp.*,
             s.firstname, s.middlename, s.lastname, s.admission_no,
             c.class, sec.section,
             fg.name AS fee_group_name,
             ft.type AS fee_type_name, ft.code AS fee_type_code
      FROM offline_fees_payments ofp
      INNER JOIN student_session ss ON ofp.student_session_id = ss.id
      INNER JOIN students s ON ss.student_id = s.id
      INNER JOIN classes c ON ss.class_id = c.id
      INNER JOIN sections sec ON ss.section_id = sec.id
      LEFT JOIN fee_groups_feetype fgft ON ofp.fee_groups_feetype_id = fgft.id
      LEFT JOIN fee_groups fg ON fgft.fee_groups_id = fg.id
      LEFT JOIN feetype ft ON fgft.feetype_id = ft.id
      ORDER BY ofp.id DESC
    `;
    return await sequelize.query(sql, { type: QueryTypes.SELECT });
  }

  async updateOfflinePaymentStatus(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const sqlGet = `SELECT * FROM offline_fees_payments WHERE id = :id`;
      const payments = await sequelize.query(sqlGet, {
        replacements: { id },
        type: QueryTypes.SELECT,
        transaction
      });
      if (payments.length === 0) {
        throw new Error('Offline payment request not found');
      }
      const payment = payments[0];

      let invoiceId = null;
      if (data.is_active === '1') {
        const depositResult = await this.feeDeposit({
          student_fees_master_id: payment.student_fees_master_id,
          fee_groups_feetype_id: payment.fee_groups_feetype_id,
          amount: parseFloat(data.amount),
          amount_discount: 0,
          amount_fine: parseFloat(data.fine || 0),
          date: payment.payment_date,
          description: `Amount credited through offline bank payment Request ID : ${payment.id}`,
          payment_mode: 'bank_payment',
          received_by: String(data.approved_by || 1)
        });
        invoiceId = `${depositResult.invoice_id}/${depositResult.sub_invoice_id}`;
      }

      const sqlUpdate = `
        UPDATE offline_fees_payments
        SET amount = :amount,
            fine = :fine,
            reply = :reply,
            is_active = :is_active,
            approve_date = :approve_date,
            approved_by = :approved_by,
            invoice_id = :invoice_id,
            updated_at = NOW()
        WHERE id = :id
      `;

      await sequelize.query(sqlUpdate, {
        replacements: {
          id,
          amount: parseFloat(data.amount),
          fine: parseFloat(data.fine || 0),
          reply: data.reply || null,
          is_active: data.is_active,
          approve_date: new Date(),
          approved_by: data.approved_by || 1,
          invoice_id: invoiceId
        },
        type: QueryTypes.UPDATE,
        transaction
      });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- Search Payment ---
  async getPaymentByInvoice(invoiceId, subInvoiceId) {
    const depositSql = `SELECT * FROM student_fees_deposite WHERE id = :invoiceId`;
    const deposits = await sequelize.query(depositSql, {
      replacements: { invoiceId },
      type: QueryTypes.SELECT
    });
    if (deposits.length === 0) return null;
    const deposit = deposits[0];

    let querySql = "";
    if (!deposit.student_transport_fee_id) {
      querySql = `
        SELECT sfd.*,
               s.id AS std_id, s.firstname, s.middlename, s.lastname, s.admission_no,
               ss.class_id, c.class, sec.section, ss.section_id, ss.student_id,
               fg.name AS fee_group_name,
               ft.type AS fee_type_name, ft.code AS fee_type_code,
               ft.is_system,
               sfm.student_session_id, ss.session_id,
               sfm.amount AS student_fees_master_amount,
               fgft.amount AS fee_groups_feetype_amount
        FROM student_fees_deposite sfd
        INNER JOIN fee_groups_feetype fgft ON fgft.id = sfd.fee_groups_feetype_id
        INNER JOIN fee_groups fg ON fg.id = fgft.fee_groups_id
        INNER JOIN feetype ft ON ft.id = fgft.feetype_id
        INNER JOIN student_fees_master sfm ON sfm.id = sfd.student_fees_master_id
        INNER JOIN student_session ss ON ss.id = sfm.student_session_id
        INNER JOIN classes c ON c.id = ss.class_id
        INNER JOIN sections sec ON sec.id = ss.section_id
        INNER JOIN students s ON s.id = ss.student_id
        WHERE sfd.id = :invoiceId
      `;
    } else {
      querySql = `
        SELECT sfd.*,
               s.firstname, s.middlename, s.lastname, s.admission_no,
               ss.class_id, c.class, sec.section, ss.section_id, ss.student_id,
               'Transport Fees' AS fee_group_name,
               'Transport Fees' AS fee_type_name,
               tfm.month AS fee_type_code,
               0 AS is_system,
               stf.student_session_id, ss.session_id
        FROM student_fees_deposite sfd
        INNER JOIN student_transport_fees stf ON stf.id = sfd.student_transport_fee_id
        INNER JOIN transport_feemaster tfm ON tfm.id = stf.transport_feemaster_id
        INNER JOIN student_session ss ON ss.id = stf.student_session_id
        INNER JOIN classes c ON c.id = ss.class_id
        INNER JOIN sections sec ON sec.id = ss.section_id
        INNER JOIN students s ON s.id = ss.student_id
        WHERE sfd.id = :invoiceId
      `;
    }

    const results = await sequelize.query(querySql, {
      replacements: { invoiceId },
      type: QueryTypes.SELECT
    });

    if (results.length === 0) return null;
    const result = results[0];

    let detail = null;
    try {
      const parsed = JSON.parse(result.amount_detail);
      detail = parsed[subInvoiceId];
    } catch (e) {
      detail = null;
    }

    if (!detail) return null;
    return { ...result, transaction: detail };
  }

  // --- Search Due Fees ---
  async getDueFees(classId, sectionId, feeGroupFeetypeIds) {
    if (!feeGroupFeetypeIds || feeGroupFeetypeIds.length === 0) {
      return [];
    }

    const whereClauses = [];
    const replacements = {};

    if (classId) {
      whereClauses.push('ss.class_id = :classId');
      replacements.classId = classId;
    }
    if (sectionId) {
      whereClauses.push('ss.section_id = :sectionId');
      replacements.sectionId = sectionId;
    }

    const whereStr = whereClauses.length > 0 ? 'AND ' + whereClauses.join(' AND ') : '';

    const sql = `
      SELECT sfm.id AS fee_master_id,
             sfm.amount AS fee_master_amount,
             fgft.feetype_id, fgft.amount AS fee_groups_feetype_amount, fgft.due_date, fgft.id AS fee_groups_feetype_id,
             fg.name AS fee_group_name, fg.is_system,
             ft.type AS fee_type_name, ft.code AS fee_type_code,
             s.id AS student_id, s.firstname, s.middlename, s.lastname, s.admission_no, s.roll_no,
             ss.id AS student_session_id, c.class, sec.section,
             sfd.id AS student_fees_deposite_id,
             IFNULL(sfd.amount_detail, '0') AS amount_detail
      FROM student_fees_master sfm
      INNER JOIN fee_session_groups fsg ON fsg.id = sfm.fee_session_group_id
      INNER JOIN fee_groups fg ON fg.id = fsg.fee_groups_id
      INNER JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = sfm.fee_session_group_id
      INNER JOIN feetype ft ON ft.id = fgft.feetype_id
      LEFT JOIN student_fees_deposite sfd ON sfd.student_fees_master_id = sfm.id AND sfd.fee_groups_feetype_id = fgft.id
      INNER JOIN student_session ss ON ss.id = sfm.student_session_id
      INNER JOIN students s ON s.id = ss.student_id
      INNER JOIN classes c ON c.id = ss.class_id
      INNER JOIN sections sec ON sec.id = ss.section_id
      WHERE fgft.id IN (:feeGroupFeetypeIds)
        AND s.is_active = 'yes'
        ${whereStr}
      ORDER BY sfm.id ASC
    `;

    replacements.feeGroupFeetypeIds = feeGroupFeetypeIds;

    const rows = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    });

    const studentsWithDues = [];

    for (const row of rows) {
      const amtDue = row.is_system ? row.fee_master_amount : row.fee_groups_feetype_amount;

      let deposited = 0;
      let discount = 0;
      let fine = 0;

      if (row.amount_detail && row.amount_detail !== '0') {
        try {
          const detail = JSON.parse(row.amount_detail);
          for (const key in detail) {
            deposited += parseFloat(detail[key].amount || 0);
            discount += parseFloat(detail[key].amount_discount || 0);
            fine += parseFloat(detail[key].amount_fine || 0);
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      const balance = amtDue - (deposited + discount);
      if (balance > 0) {
        studentsWithDues.push({
          student_session_id: row.student_session_id,
          student_id: row.student_id,
          firstname: row.firstname,
          middlename: row.middlename,
          lastname: row.lastname,
          admission_no: row.admission_no,
          roll_no: row.roll_no,
          class: row.class,
          section: row.section,
          fee_group: row.fee_group_name,
          fee_type: row.fee_type_name,
          fee_code: row.fee_type_code,
          due_date: row.due_date,
          amount: amtDue,
          deposited,
          discount,
          fine,
          balance
        });
      }
    }

    return studentsWithDues;
  }

  // --- Carry Forward ---
  async getCarryForwardList(classId, sectionId, currentSession = 21) {
    const [prevSession] = await sequelize.query(
      `SELECT * FROM sessions WHERE id < :currentSession ORDER BY id DESC LIMIT 1`,
      {
        replacements: { currentSession },
        type: QueryTypes.SELECT
      }
    );
    if (!prevSession) {
      return { students: [], is_update: false };
    }

    const studentsSql = `
      SELECT ss.student_id,
             ss.id AS current_student_session_id,
             ss.class_id AS current_session_class_id,
             ps.id AS previous_student_session_id,
             s.firstname, s.middlename, s.lastname,
             s.admission_no, s.roll_no, s.father_name, s.admission_date
      FROM student_session ss
      LEFT JOIN (SELECT * FROM student_session WHERE session_id = :prevSessionId) ps ON ss.student_id = ps.student_id
      INNER JOIN students s ON s.id = ss.student_id
      WHERE ss.session_id = :currentSession
        AND ss.class_id = :classId
        AND ss.section_id = :sectionId
        AND s.is_active = 'yes'
      ORDER BY s.firstname ASC
    `;
    const students = await sequelize.query(studentsSql, {
      replacements: { prevSessionId: prevSession.id, currentSession, classId, sectionId },
      type: QueryTypes.SELECT
    });

    if (students.length === 0) {
      return { students: [], is_update: false };
    }

    const studentSessionIds = students.map(s => s.current_student_session_id);
    const existingBalancesSql = `
      SELECT sfm.*
      FROM student_fees_master sfm
      INNER JOIN fee_session_groups fsg ON fsg.id = sfm.fee_session_group_id
      INNER JOIN fee_groups fg ON fg.id = fsg.fee_groups_id
      WHERE sfm.student_session_id IN (:studentSessionIds)
        AND fg.name = 'Balance Master'
        AND fsg.session_id = :currentSession
    `;
    const existingBalances = await sequelize.query(existingBalancesSql, {
      replacements: { studentSessionIds, currentSession },
      type: QueryTypes.SELECT
    });

    const isUpdate = existingBalances.length > 0;
    const balanceMap = new Map();
    existingBalances.forEach(eb => {
      balanceMap.set(eb.student_session_id, parseFloat(eb.amount));
    });

    const resultStudents = [];

    for (const student of students) {
      let balance = 0;

      if (isUpdate) {
        balance = balanceMap.get(student.current_student_session_id) || 0;
      } else if (student.previous_student_session_id) {
        const prevFeesSql = `
          SELECT sfm.id AS fee_master_id,
                 sfm.amount AS fee_master_amount,
                 sfm.is_system,
                 fgft.amount AS fee_groups_feetype_amount,
                 sfd.amount_detail
          FROM student_fees_master sfm
          INNER JOIN fee_session_groups fsg ON fsg.id = sfm.fee_session_group_id
          INNER JOIN fee_groups fg ON fg.id = fsg.fee_groups_id
          INNER JOIN fee_groups_feetype fgft ON fgft.fee_session_group_id = sfm.fee_session_group_id
          LEFT JOIN student_fees_deposite sfd ON sfd.student_fees_master_id = sfm.id AND sfd.fee_groups_feetype_id = fgft.id
          WHERE sfm.student_session_id = :prevStudentSessionId
        `;
        const prevFees = await sequelize.query(prevFeesSql, {
          replacements: { prevStudentSessionId: student.previous_student_session_id },
          type: QueryTypes.SELECT
        });

        let totalFee = 0;
        let deposit = 0;
        let discount = 0;

        for (const fee of prevFees) {
          const amtDue = fee.is_system ? parseFloat(fee.fee_master_amount) : parseFloat(fee.fee_groups_feetype_amount);
          totalFee += amtDue;

          if (fee.amount_detail) {
            try {
              const detail = JSON.parse(fee.amount_detail);
              for (const key in detail) {
                deposit += parseFloat(detail[key].amount || 0);
                discount += parseFloat(detail[key].amount_discount || 0);
              }
            } catch (e) {
              // ignore
            }
          }
        }

        balance = totalFee - (deposit + discount);
      }

      resultStudents.push({
        student_session_id: student.current_student_session_id,
        name: `${student.firstname || ''} ${student.middlename || ''} ${student.lastname || ''}`.trim().replace(/\s+/g, ' '),
        admission_no: student.admission_no,
        roll_no: student.roll_no,
        father_name: student.father_name,
        admission_date: student.admission_date,
        balance: balance > 0 ? balance : 0
      });
    }

    return { students: resultStudents, is_update: isUpdate };
  }

  async saveCarryForward(classId, sectionId, dueDate, students, currentSession = 21) {
    const transaction = await sequelize.transaction();
    try {
      let [group] = await sequelize.query(
        `SELECT * FROM fee_groups WHERE name = 'Balance Master' LIMIT 1`,
        { type: QueryTypes.SELECT, transaction }
      );
      if (!group) {
        const [insertGroupResult] = await sequelize.query(
          `INSERT INTO fee_groups (name, is_system, is_active, created_at, updated_at) VALUES ('Balance Master', 1, 'yes', NOW(), NOW())`,
          { type: QueryTypes.INSERT, transaction }
        );
        group = { id: insertGroupResult, name: 'Balance Master' };
      }

      let [type] = await sequelize.query(
        `SELECT * FROM feetype WHERE type = 'Balance' LIMIT 1`,
        { type: QueryTypes.SELECT, transaction }
      );
      if (!type) {
        const [insertTypeResult] = await sequelize.query(
          `INSERT INTO feetype (type, code, is_system, is_active, created_at, updated_at) VALUES ('Balance', 'Balance', 1, 'yes', NOW(), NOW())`,
          { type: QueryTypes.INSERT, transaction }
        );
        type = { id: insertTypeResult, type: 'Balance' };
      }

      let [sessionGroup] = await sequelize.query(
        `SELECT * FROM fee_session_groups WHERE fee_groups_id = :groupId AND session_id = :sessionId LIMIT 1`,
        {
          replacements: { groupId: group.id, sessionId: currentSession },
          type: QueryTypes.SELECT,
          transaction
        }
      );
      if (!sessionGroup) {
        const [insertSessionGroupResult] = await sequelize.query(
          `INSERT INTO fee_session_groups (fee_groups_id, session_id, is_active, created_at, updated_at) VALUES (:groupId, :sessionId, 'yes', NOW(), NOW())`,
          {
            replacements: { groupId: group.id, sessionId: currentSession },
            type: QueryTypes.INSERT,
            transaction
          }
        );
        sessionGroup = { id: insertSessionGroupResult };
      }

      let [fgft] = await sequelize.query(
        `SELECT * FROM fee_groups_feetype WHERE fee_session_group_id = :fsgId AND feetype_id = :typeId AND session_id = :sessionId LIMIT 1`,
        {
          replacements: { fsgId: sessionGroup.id, typeId: type.id, sessionId: currentSession },
          type: QueryTypes.SELECT,
          transaction
        }
      );
      if (!fgft) {
        await sequelize.query(
          `INSERT INTO fee_groups_feetype (fee_session_group_id, fee_groups_id, feetype_id, session_id, amount, fine_type, due_date, is_active, created_at, updated_at)
           VALUES (:fsgId, :groupId, :typeId, :sessionId, 0.00, 'none', :dueDate, 'yes', NOW(), NOW())`,
          {
            replacements: {
              fsgId: sessionGroup.id,
              groupId: group.id,
              typeId: type.id,
              sessionId: currentSession,
              dueDate
            },
            type: QueryTypes.INSERT,
            transaction
          }
        );
      } else {
        await sequelize.query(
          `UPDATE fee_groups_feetype SET due_date = :dueDate, updated_at = NOW() WHERE id = :id`,
          {
            replacements: { dueDate, id: fgft.id },
            type: QueryTypes.UPDATE,
            transaction
          }
        );
      }

      for (const std of students) {
        const amount = parseFloat(std.amount || 0);

        const [existingMaster] = await sequelize.query(
          `SELECT * FROM student_fees_master WHERE student_session_id = :studentSessionId AND fee_session_group_id = :fsgId LIMIT 1`,
          {
            replacements: { studentSessionId: std.student_session_id, fsgId: sessionGroup.id },
            type: QueryTypes.SELECT,
            transaction
          }
        );

        if (existingMaster) {
          await sequelize.query(
            `UPDATE student_fees_master SET amount = :amount WHERE id = :id`,
            {
              replacements: { amount, id: existingMaster.id },
              type: QueryTypes.UPDATE,
              transaction
            }
          );
        } else {
          await sequelize.query(
            `INSERT INTO student_fees_master (student_session_id, fee_session_group_id, amount, is_system)
             VALUES (:studentSessionId, :fsgId, :amount, 1)`,
            {
              replacements: { studentSessionId: std.student_session_id, fsgId: sessionGroup.id, amount },
              type: QueryTypes.INSERT,
              transaction
            }
          );
        }
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default FeeRepository;

