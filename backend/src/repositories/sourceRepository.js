import Source from '../models/source.js';

class SourceRepository {
  async get(id = null) {
    if (id !== null) {
      return await Source.findByPk(id);
    }
    return await Source.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Source.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await Source.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await Source.destroy({ where: { id } });
  }
}

export default SourceRepository;
