import express from 'express';
import FeeController from '../controllers/feeController.js';

const router = express.Router();
const controller = new FeeController();

// Fee Types
router.get('/types', controller.getFeeTypes);
router.post('/types', controller.saveFeeType);
router.put('/types/:id', controller.updateFeeType);
router.delete('/types/:id', controller.deleteFeeType);

// Fee Groups
router.get('/groups', controller.getFeeGroups);
router.post('/groups', controller.saveFeeGroup);
router.put('/groups/:id', controller.updateFeeGroup);
router.delete('/groups/:id', controller.deleteFeeGroup);

// Fee Masters
router.get('/masters', controller.getFeeMasters);
router.post('/masters', controller.saveFeeMaster);
router.put('/masters/:id', controller.updateFeeMaster);
router.delete('/masters/:id', controller.deleteFeeMaster);

// Fee Discounts
router.get('/discounts', controller.getDiscounts);
router.post('/discounts', controller.saveDiscount);
router.put('/discounts/:id', controller.updateDiscount);
router.delete('/discounts/:id', controller.deleteDiscount);
router.get('/discounts/search-students', controller.searchAssignDiscountStudents);
router.post('/discounts/allot', controller.allotDiscount);
router.post('/discounts/apply', controller.applyDiscount);

// Fees Reminders
router.get('/reminders', controller.getReminders);
router.post('/reminders/batch', controller.updateRemindersBatch);

// Desk / Payment
router.get('/student', controller.getStudentFees);
router.post('/deposit', controller.depositFee);
router.get('/deposits', controller.getFeeDeposits);

// Offline Bank Payments
router.get('/offline-payments', controller.getOfflinePayments);
router.put('/offline-payments/:id', controller.updateOfflinePayment);

// Search Payment
router.get('/payments/search', controller.searchPayment);

// Search Due Fees
router.get('/due-fees', controller.getDueFees);

// Carry Forward
router.get('/carry-forward', controller.getCarryForwardList);
router.post('/carry-forward', controller.saveCarryForward);

export default router;
