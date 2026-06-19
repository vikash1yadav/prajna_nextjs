import DisableReason from '../models/disableReason.js';

class DisableReasonRepository {
  async get(id = null) {
    if (id !== null) {
      return await DisableReason.findByPk(id);
    }
    return await DisableReason.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await DisableReason.update(updateData, { where: { id } });
      return id;
    } else {
      const reasonObj = await DisableReason.create(data);
      return reasonObj.id;
    }
  }

  async remove(id) {
    return await DisableReason.destroy({ where: { id } });
  }
}

export default DisableReasonRepository;
