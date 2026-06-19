import Category from '../models/category.js';

class CategoryRepository {
  async get(id = null) {
    if (id !== null) {
      return await Category.findByPk(id);
    }
    return await Category.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Category.update(updateData, { where: { id } });
      return id;
    } else {
      const categoryObj = await Category.create(data);
      return categoryObj.id;
    }
  }

  async remove(id) {
    return await Category.destroy({ where: { id } });
  }
}

export default CategoryRepository;
