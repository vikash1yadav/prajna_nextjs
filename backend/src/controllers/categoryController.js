import CategoryService from '../services/categoryService.js';

class CategoryController {
  constructor() {
    this.categoryService = new CategoryService();
  }

  getCategories = async (req, res, next) => {
    try {
      const id = req.params.id || req.query.id || null;
      const data = await this.categoryService.getCategories(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveCategory = async (req, res, next) => {
    try {
      // Allow putting ID in params or body
      const id = req.params.id || req.body.id || null;
      const categoryData = {
        ...req.body,
        id: id ? parseInt(id) : undefined
      };
      const savedId = await this.categoryService.saveCategory(categoryData);
      return res.status(200).json({
        success: true,
        message: id ? 'Category updated successfully' : 'Category created successfully',
        id: savedId
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await this.categoryService.deleteCategory(id);
      return res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default CategoryController;
