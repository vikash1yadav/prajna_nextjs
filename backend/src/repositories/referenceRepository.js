import Reference from '../models/reference.js';

class ReferenceRepository {
  async get(id = null) {
    if (id !== null) {
      return await Reference.findByPk(id);
    }
    return await Reference.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Reference.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await Reference.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await Reference.destroy({ where: { id } });
  }
}

export default ReferenceRepository;
