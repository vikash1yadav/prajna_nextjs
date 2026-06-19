import OnlineAdmission from '../models/onlineAdmission.js';
import ClassSection from '../models/classSection.js';
import Class from '../models/class.js';
import Section from '../models/section.js';
import Student from '../models/student.js';
import StudentSession from '../models/studentSession.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

class OnlineAdmissionRepository {

  async getAll(classId, sectionId, searchTerm) {
    let whereClause = {};
    let classSectionWhere = {};

    if (searchTerm) {
      whereClause = {
        [Op.or]: [
          { firstname: { [Op.like]: `%${searchTerm}%` } },
          { lastname: { [Op.like]: `%${searchTerm}%` } },
          { reference_no: { [Op.like]: `%${searchTerm}%` } },
          { mobileno: { [Op.like]: `%${searchTerm}%` } }
        ]
      };
    }

    if (classId) {
      classSectionWhere.class_id = classId;
    }
    if (sectionId) {
      classSectionWhere.section_id = sectionId;
    }

    ClassSection.belongsTo(Class, { foreignKey: 'class_id' });
    ClassSection.belongsTo(Section, { foreignKey: 'section_id' });
    OnlineAdmission.belongsTo(ClassSection, { foreignKey: 'class_section_id' });

    const admissions = await OnlineAdmission.findAll({
      where: whereClause,
      include: [
        {
          model: ClassSection,
          where: Object.keys(classSectionWhere).length > 0 ? classSectionWhere : undefined,
          include: [
            { model: Class },
            { model: Section }
          ],
          required: Object.keys(classSectionWhere).length > 0
        }
      ],
      order: [['id', 'DESC']]
    });

    return admissions.map(adm => {
      const plain = adm.get({ plain: true });
      return {
        ...plain,
        class: plain.ClassSection?.Class?.class,
        section: plain.ClassSection?.Section?.section
      };
    });
  }

  async getById(id) {
    return await OnlineAdmission.findByPk(id);
  }

  async remove(id) {
    return await OnlineAdmission.destroy({
      where: { id: id }
    });
  }

  async enroll(id, currentSession = 21) {
    const transaction = await sequelize.transaction();
    try {
      const admission = await OnlineAdmission.findByPk(id, { transaction });
      
      if (!admission) {
        throw new Error('Online admission record not found');
      }
      
      if (admission.is_enroll === 1) {
        throw new Error('Already enrolled');
      }

      const admissionNo = `AD-${Date.now().toString().slice(-6)}`;

      // Move to students table
      const studentData = {
        admission_no: admissionNo,
        firstname: admission.firstname,
        middlename: admission.middlename,
        lastname: admission.lastname,
        gender: admission.gender,
        dob: admission.dob,
        mobileno: admission.mobileno,
        email: admission.email,
        father_name: admission.father_name,
        father_phone: admission.father_phone,
        father_occupation: admission.father_occupation,
        mother_name: admission.mother_name,
        mother_phone: admission.mother_phone,
        mother_occupation: admission.mother_occupation,
        guardian_name: admission.guardian_name,
        guardian_relation: admission.guardian_relation,
        guardian_phone: admission.guardian_phone,
        guardian_email: admission.guardian_email,
        current_address: admission.current_address,
        permanent_address: admission.permanent_address,
        category_id: admission.category_id ? admission.category_id.toString() : null,
        blood_group: admission.blood_group || '',
        adhar_no: admission.adhar_no,
        samagra_id: admission.samagra_id,
        bank_account_no: admission.bank_account_no,
        bank_name: admission.bank_name,
        ifsc_code: admission.ifsc_code,
      };

      const newStudent = await Student.create(studentData, { transaction });

      // Create student_session
      if (admission.class_section_id) {
        const classSection = await ClassSection.findByPk(admission.class_section_id, { transaction });
        if (classSection) {
          await StudentSession.create({
            student_id: newStudent.id,
            class_id: classSection.class_id,
            section_id: classSection.section_id,
            session_id: currentSession
          }, { transaction });
        }
      }

      // Update online admission status
      await admission.update({ is_enroll: 1 }, { transaction });

      await transaction.commit();
      return newStudent.id;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

}

export default OnlineAdmissionRepository;
