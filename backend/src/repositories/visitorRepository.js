import Visitor from '../models/visitor.js';

class VisitorRepository {
  async get(id = null) {
    if (id !== null) {
      return await Visitor.findByPk(id);
    }
    return await Visitor.findAll({
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Visitor.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await Visitor.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await Visitor.destroy({ where: { id } });
  }
}

export default VisitorRepository;
