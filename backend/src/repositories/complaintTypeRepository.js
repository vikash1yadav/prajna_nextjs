import ComplaintType from '../models/complaintType.js';

class ComplaintTypeRepository {
  async get(id = null) {
    if (id !== null) {
      return await ComplaintType.findByPk(id);
    }
    return await ComplaintType.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await ComplaintType.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await ComplaintType.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await ComplaintType.destroy({ where: { id } });
  }
}

export default ComplaintTypeRepository;
