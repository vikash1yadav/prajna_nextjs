import VisitorPurpose from '../models/visitorPurpose.js';

class VisitorPurposeRepository {
  async get(id = null) {
    if (id !== null) {
      return await VisitorPurpose.findByPk(id);
    }
    return await VisitorPurpose.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await VisitorPurpose.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await VisitorPurpose.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await VisitorPurpose.destroy({ where: { id } });
  }
}

export default VisitorPurposeRepository;
