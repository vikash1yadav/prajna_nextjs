import GeneralCall from '../models/generalCall.js';

class GeneralCallRepository {
  async get(id = null) {
    if (id !== null) {
      return await GeneralCall.findByPk(id);
    }
    return await GeneralCall.findAll({
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await GeneralCall.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await GeneralCall.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await GeneralCall.destroy({ where: { id } });
  }
}

export default GeneralCallRepository;
