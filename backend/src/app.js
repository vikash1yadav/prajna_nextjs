import express from 'express';
import cors from 'cors';

import sessionRoutes from './routes/sessionRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import classRoutes from './routes/classRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import examRoutes from './routes/examRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import onlineAdmissionRoutes from './routes/onlineAdmissionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import schoolHouseRoutes from './routes/schoolHouseRoutes.js';
import disableReasonRoutes from './routes/disableReasonRoutes.js';
import visitorPurposeRoutes from './routes/visitorPurposeRoutes.js';
import complaintTypeRoutes from './routes/complaintTypeRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import referenceRoutes from './routes/referenceRoutes.js';
import dispatchReceiveRoutes from './routes/dispatchReceiveRoutes.js';
import generalCallRoutes from './routes/generalCallRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import academicsRoutes from './routes/academicsRoutes.js';
import lessonPlanRoutes from './routes/lessonPlanRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use((req, res, next) => {
  if (!global.MOCK_DB_MODE) {
    return next();
  }

  const path = req.path;
  const method = req.method;

  // Let authentication endpoints go through to controllers
  if (path === '/login' || path === '/logout' || path === '/me') {
    return next();
  }

  // Intercept and return high-quality mock data for client testing
  if (path === '/api/classes' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, class: 'Class 1' },
        { id: 2, class: 'Class 2' },
        { id: 3, class: 'Class 3' }
      ]
    });
  }

  if (path.match(/^\/api\/classes\/\d+\/sections$/) && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, section: 'A' },
        { id: 2, section: 'B' }
      ]
    });
  }

  if (path.match(/^\/api\/sections\/class\/\d+$/) && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, section: 'A' },
        { id: 2, section: 'B' }
      ]
    });
  }

  if (path === '/api/attendance/types' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, type: 'Present' },
        { id: 2, type: 'Absent' },
        { id: 3, type: 'Late' }
      ]
    });
  }

  if (path.startsWith('/api/attendance/search') && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 101, student_session_id: 101, admission_no: '1001', firstname: 'John', lastname: 'Doe', roll_no: '1', attendence_type_id: 1, remark: 'On time' },
        { id: 102, student_session_id: 102, admission_no: '1002', firstname: 'Jane', lastname: 'Smith', roll_no: '2', attendence_type_id: 2, remark: 'Sick leave' }
      ]
    });
  }

  if (path === '/api/attendance/monthly' && method === 'GET') {
    // Mock monthly attendance calendar
    const records = [];
    const days = 30;
    for (let i = 1; i <= days; i++) {
      records.push({
        date: `2026-06-${String(i).padStart(2, '0')}`,
        attendence_type_id: i % 10 === 0 ? 2 : (i % 7 === 0 ? 3 : 1),
        remark: i % 10 === 0 ? 'Absent' : 'Present'
      });
    }
    return res.json({
      success: true,
      data: records
    });
  }

  if (path === '/api/dashboard/stats' && method === 'GET') {
    const monthly_fees_expenses = [];
    for (let i = 1; i <= 30; i++) {
      const dayStr = String(i).padStart(2, '0');
      const coll = i % 5 === 0 ? 1200 + (i * 50) : i % 3 === 0 ? 800 + (i * 20) : 0;
      const exp = i % 10 === 0 ? 1500 + (i * 30) : i % 7 === 0 ? 400 + (i * 10) : 0;
      monthly_fees_expenses.push({ day: dayStr, Collection: coll, Expense: exp });
    }
    return res.json({
      success: true,
      data: {
        fees_awaiting: { unpaid: 10, total: 35 },
        staff_leaves: { approved: 2, total: 15 },
        student_leaves: { approved: 4, total: 24 },
        converted_leads: { converted: 8, total: 20 },
        staff_present: { present: 11, total: 13 },
        student_present: { present: 18, total: 20 },
        monthly_fees_expenses,
        session_fees_expenses: [
          { month: 'June', Collection: 35000, Expense: 20000 },
          { month: 'July', Collection: 38000, Expense: 21000 },
          { month: 'August', Collection: 45000, Expense: 23000 },
          { month: 'September', Collection: 40000, Expense: 22000 },
          { month: 'October', Collection: 48000, Expense: 25000 },
          { month: 'November', Collection: 52000, Expense: 28000 },
          { month: 'December', Collection: 50000, Expense: 26000 },
          { month: 'January', Collection: 58000, Expense: 29000 },
          { month: 'February', Collection: 62000, Expense: 31000 },
          { month: 'March', Collection: 60000, Expense: 30000 },
          { month: 'April', Collection: 70000, Expense: 34000 },
          { month: 'May', Collection: 75000, Expense: 36000 }
        ],
        income_sources: [
          { name: 'Tuition Fees', value: 45000 },
          { name: 'Admission Fees', value: 12000 },
          { name: 'Transport Fees', value: 8000 },
          { name: 'Library Fine', value: 1500 }
        ],
        expense_sources: [
          { name: 'Staff Salary', value: 25000 },
          { name: 'Maintenance', value: 5000 },
          { name: 'Electricity', value: 2500 },
          { name: 'Stationery', value: 1800 }
        ]
      }
    });
  }

  if (path.match(/^\/api\/students\/\d+$/) && method === 'GET') {
    return res.json({
      success: true,
      data: {
        id: 101,
        admission_no: '1001',
        roll_no: '1',
        class_id: 1,
        section_id: 1,
        class: 'Class 1',
        section: 'A',
        firstname: 'John',
        middlename: 'M',
        lastname: 'Doe',
        gender: 'Male',
        dob: '2015-05-12',
        email: 'john@example.com',
        mobileno: '1234567890',
        admission_date: '2023-04-01',
        blood_group: 'O+',
        father_name: 'Robert Doe',
        father_phone: '9876543210',
        mother_name: 'Sarah Doe',
        guardian_name: 'Robert Doe',
        guardian_relation: 'Father',
        guardian_phone: '9876543210',
        guardian_email: 'robert@example.com',
        guardian_address: '123 Main Street',
        current_address: '123 Main Street',
        permanent_address: '123 Main Street',
        bank_name: 'State Bank',
        bank_account_no: '987654321012',
        ifsc_code: 'SBIN0001234',
        adhar_no: '123456789012',
        samagra_id: '987654321'
      }
    });
  }

  if (path === '/api/students' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 101, admission_no: '1001', roll_no: '1', firstname: 'John', lastname: 'Doe', class: 'Class 1', section: 'A', father_name: 'Robert Doe', email: 'john@example.com', mobileno: '1234567890' },
        { id: 102, admission_no: '1002', roll_no: '2', firstname: 'Jane', lastname: 'Smith', class: 'Class 1', section: 'A', father_name: 'William Smith', email: 'jane@example.com', mobileno: '0987654321' }
      ]
    });
  }

  if (path === '/api/students' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Student saved successfully (Mock)',
      id: 103
    });
  }

  if (path.match(/^\/api\/students\/\d+$/) && method === 'PUT') {
    return res.json({
      success: true,
      message: 'Student updated successfully (Mock)',
      id: parseInt(path.split('/').pop())
    });
  }

  if (path.match(/^\/api\/students\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Student deleted successfully (Mock)'
    });
  }

  if (path === '/api/exams' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, name: 'First Term Exam', is_active: 1 },
        { id: 2, name: 'Second Term Exam', is_active: 0 }
      ]
    });
  }

  if (path === '/api/exams/groups' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, name: 'Term 1 Group' }
      ]
    });
  }

  if (path.startsWith('/api/fees/student') && method === 'GET') {
    return res.json({
      success: true,
      data: [
        {
          id: 101,
          student_session_id: 101,
          firstname: 'John',
          lastname: 'Doe',
          admission_no: '1001',
          class: 'Class 1',
          section: 'A',
          fees: [
            { id: 1, fee_type: 'Tuition Fee', amount: 5000, paid: 3000, status: 'partial' },
            { id: 2, fee_type: 'Admission Fee', amount: 2000, paid: 2000, status: 'paid' },
            { id: 3, fee_type: 'Exam Fee', amount: 1000, paid: 0, status: 'unpaid' }
          ]
        }
      ]
    });
  }

  if (path === '/api/fees/deposits' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        {
          id: 501,
          fee_group_name: 'Class 1 Fees',
          fee_type_name: 'Tuition Fee',
          fee_type_code: 'TF',
          amount_detail: JSON.stringify({
            "1": {
              amount: 3000,
              amount_discount: 0,
              amount_fine: 0,
              date: '2026-05-10',
              description: 'First installment',
              payment_mode: 'Cash'
            }
          })
        }
      ]
    });
  }

  if (path === '/api/fees/masters' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, feetype_id: 1, class_id: 1, amount: 5000, description: 'Tuition fee for Class 1', is_active: 'yes' }
      ]
    });
  }

  if (path === '/api/fees/masters' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Fee master saved successfully (Mock)',
      id: 10
    });
  }

  if (path.match(/^\/api\/fees\/masters\/\d+$/) && method === 'PUT') {
    return res.json({
      success: true,
      message: 'Fee master updated successfully (Mock)'
    });
  }

  if (path.match(/^\/api\/fees\/masters\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Fee master deleted successfully (Mock)'
    });
  }

  // Mock Income
  if (path === '/api/income/heads' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, income_category: 'Donations', description: 'General donations', is_active: 'yes' },
        { id: 2, income_category: 'Rental', description: 'Hall rental income', is_active: 'yes' }
      ]
    });
  }
  if (path === '/api/income/heads' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Income head saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/income\/heads\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Income head deleted successfully (Mock)'
    });
  }
  if (path === '/api/income' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, name: 'Alumni Donation', invoice_no: 'INC-001', income_head_id: 1, date: '2026-06-18', amount: 5000, note: 'Received from John', is_active: 'yes', IncomeHead: { id: 1, income_category: 'Donations' } },
        { id: 2, name: 'Hall Rent', invoice_no: 'INC-002', income_head_id: 2, date: '2026-06-19', amount: 1200, note: 'Weekly renting', is_active: 'yes', IncomeHead: { id: 2, income_category: 'Rental' } }
      ]
    });
  }
  if (path === '/api/income' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Income saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/income\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Income deleted successfully (Mock)'
    });
  }

  // Mock Expenses
  if (path === '/api/expenses/heads' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, exp_category: 'Salaries', description: 'Staff monthly salaries', is_active: 'yes' },
        { id: 2, exp_category: 'Electricity', description: 'Power bills', is_active: 'yes' }
      ]
    });
  }
  if (path === '/api/expenses/heads' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Expense head saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/expenses\/heads\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Expense head deleted successfully (Mock)'
    });
  }
  if (path === '/api/expenses' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, name: 'Teacher Salary', invoice_no: 'EXP-001', exp_head_id: 1, date: '2026-06-15', amount: 15000, note: 'Paid June salaries', is_active: 'yes', ExpenseHead: { id: 1, exp_category: 'Salaries' } },
        { id: 2, name: 'Utility Bill', invoice_no: 'EXP-002', exp_head_id: 2, date: '2026-06-17', amount: 2300, note: 'Office power bill', is_active: 'yes', ExpenseHead: { id: 2, exp_category: 'Electricity' } }
      ]
    });
  }
  if (path === '/api/expenses' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Expense saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/expenses\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Expense deleted successfully (Mock)'
    });
  }

  // Mock Leaves
  if (path === '/api/leaves' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, student_session_id: 101, from_date: '2026-06-20', to_date: '2026-06-22', apply_date: '2026-06-19', apply_leave_status: 0, status: 0, reason: 'Family function', firstname: 'John', lastname: 'Doe', admission_no: '1001', class: 'Class 1', section: 'A' },
        { id: 2, student_session_id: 102, from_date: '2026-06-21', to_date: '2026-06-23', apply_date: '2026-06-18', apply_leave_status: 1, status: 1, reason: 'Medical emergency', firstname: 'Jane', lastname: 'Smith', admission_no: '1002', class: 'Class 1', section: 'A', staff_name: 'Admin', approve_date: '2026-06-18' }
      ]
    });
  }
  if (path === '/api/leaves' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Leave request submitted successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/leaves\/\d+\/status$/) && method === 'PUT') {
    return res.json({
      success: true,
      message: 'Leave request status updated successfully (Mock)'
    });
  }
  if (path.match(/^\/api\/leaves\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Leave request deleted successfully (Mock)'
    });
  }

  // Mock Academics
  if (path === '/api/academics/subject-groups' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Science Group',
          description: 'Science stream group',
          session_id: 1,
          subjects: [
            { id: 1, name: 'Physics', code: 'PHY101', type: 'Theory' },
            { id: 2, name: 'Chemistry', code: 'CHM101', type: 'Theory' }
          ],
          sections: [
            { class_section_id: 1, class_id: 1, section_id: 1, class_name: 'Class 1', section_name: 'A' }
          ]
        }
      ]
    });
  }
  if (path === '/api/academics/subject-groups' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Subject Group saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/academics\/subject-groups\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Subject Group deleted successfully (Mock)'
    });
  }
  if (path === '/api/academics/class-teachers' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        {
          class_id: 1,
          section_id: 1,
          class_name: 'Class 1',
          section_name: 'A',
          teachers: [
            { ct_id: 1, staff_id: 1, name: 'Admin Staff', employee_id: 'EMP001' }
          ]
        }
      ]
    });
  }
  if (path === '/api/academics/class-teachers' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Class teachers assigned successfully (Mock)'
    });
  }
  if (path === '/api/academics/timetable' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, session_id: 1, class_id: 1, section_id: 1, subject_group_id: 1, subject_group_subject_id: 1, staff_id: 1, day: 'Monday', time_from: '09:00 AM', time_to: '10:00 AM', start_time: '09:00:00', end_time: '10:00:00', room_no: 'Room 101', subject_name: 'Physics', staff_name: 'Admin Staff' }
      ]
    });
  }
  if (path === '/api/academics/timetable' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Subject Timetable saved successfully (Mock)'
    });
  }
  if (path.match(/^\/api\/academics\/timetable\/teacher\/\d+$/) && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, session_id: 1, class_id: 1, section_id: 1, subject_group_id: 1, subject_group_subject_id: 1, staff_id: 1, day: 'Monday', time_from: '09:00 AM', time_to: '10:00 AM', start_time: '09:00:00', end_time: '10:00:00', room_no: 'Room 101', class_name: 'Class 1', section_name: 'A', subject_name: 'Physics' }
      ]
    });
  }
  if (path === '/api/academics/promote-students' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Students promoted successfully (Mock)',
      data: []
    });
  }

  // Mock Lesson Plan
  if (path === '/api/lesson-plan/lessons' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, session_id: 1, subject_group_subject_id: 1, subject_group_class_sections_id: 1, name: 'Introduction to Mechanics', subject_name: 'Physics', subject_code: 'PHY101' }
      ]
    });
  }
  if (path === '/api/lesson-plan/lessons' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Lesson saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/lesson-plan\/lessons\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Lesson deleted successfully (Mock)'
    });
  }
  if (path === '/api/lesson-plan/topics' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, session_id: 1, lesson_id: 1, name: 'Newton Laws', status: 1, complete_date: '2026-06-19' },
        { id: 2, session_id: 1, lesson_id: 1, name: 'Friction', status: 0, complete_date: null }
      ]
    });
  }
  if (path === '/api/lesson-plan/topics' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Topic saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/lesson-plan\/topics\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Topic deleted successfully (Mock)'
    });
  }
  if (path === '/api/lesson-plan/syllabus-status' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        {
          lesson_id: 1,
          lesson_name: 'Introduction to Mechanics',
          topics: [
            { topic_id: 1, topic_name: 'Newton Laws', status: 1, complete_date: '2026-06-19' },
            { topic_id: 2, topic_name: 'Friction', status: 0, complete_date: null }
          ]
        }
      ]
    });
  }
  if (path === '/api/lesson-plan/syllabus-logs' && method === 'GET') {
    return res.json({
      success: true,
      data: [
        { id: 1, topic_id: 1, session_id: 1, created_by: 1, created_for: 1, date: '2026-06-19', time_from: '09:00 AM', time_to: '10:00 AM', presentation: 'Slides', attachment: null, sub_topic: 'First Law', teaching_method: 'Board', general_objectives: 'Understand rest/motion', previous_knowledge: 'Basic forces', comprehensive_questions: 'What is inertia?', status: 1, staff_name: 'Admin Staff' }
      ]
    });
  }
  if (path === '/api/lesson-plan/syllabus-logs' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Syllabus log saved successfully (Mock)',
      data: { id: Date.now() }
    });
  }
  if (path.match(/^\/api\/lesson-plan\/syllabus-logs\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: 'Syllabus log deleted successfully (Mock)'
    });
  }
  if (path === '/api/lesson-plan/copy-lessons' && method === 'POST') {
    return res.json({
      success: true,
      message: 'Lessons copied successfully (Mock)',
      data: []
    });
  }

  next();

});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api', staffRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/online-admissions', onlineAdmissionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/school-houses', schoolHouseRoutes);
app.use('/api/disable-reasons', disableReasonRoutes);
app.use('/api/visitor-purposes', visitorPurposeRoutes);
app.use('/api/complaint-types', complaintTypeRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/dispatch-receives', dispatchReceiveRoutes);
app.use('/api/general-calls', generalCallRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/lesson-plan', lessonPlanRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

export default app;
