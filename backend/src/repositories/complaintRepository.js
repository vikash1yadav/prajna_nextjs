import Complaint from '../models/complaint.js';

class ComplaintRepository {
  async get(id = null) {
    if (id !== null) {
      return await Complaint.findByPk(id);
    }
    return await Complaint.findAll({
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Complaint.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await Complaint.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await Complaint.destroy({ where: { id } });
  }
}

export default ComplaintRepository;
