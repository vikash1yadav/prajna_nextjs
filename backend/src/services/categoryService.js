import CategoryRepository from '../repositories/categoryRepository.js';

class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getCategories(id = null) {
    return await this.categoryRepository.get(id);
  }

  async saveCategory(categoryData) {
    if (!categoryData.category || categoryData.category.trim() === '') {
      throw new Error('Category name is required');
    }
    return await this.categoryRepository.add(categoryData);
  }

  async deleteCategory(id) {
    if (!id) {
      throw new Error('Category ID is required');
    }
    return await this.categoryRepository.remove(id);
  }
}

export default CategoryService;
