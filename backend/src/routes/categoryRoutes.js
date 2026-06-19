import express from 'express';
import CategoryController from '../controllers/categoryController.js';

const router = express.Router();
const controller = new CategoryController();

router.get('/', controller.getCategories);
router.get('/:id', controller.getCategories);
router.post('/', controller.saveCategory);
router.put('/:id', controller.saveCategory);
router.delete('/:id', controller.deleteCategory);

export default router;
