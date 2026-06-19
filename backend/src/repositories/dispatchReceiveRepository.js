import DispatchReceive from '../models/dispatchReceive.js';

class DispatchReceiveRepository {
  async get(id = null, type = null) {
    if (id !== null) {
      return await DispatchReceive.findByPk(id);
    }
    const where = {};
    if (type !== null) {
      where.type = type;
    }
    return await DispatchReceive.findAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await DispatchReceive.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await DispatchReceive.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await DispatchReceive.destroy({ where: { id } });
  }
}

export default DispatchReceiveRepository;
