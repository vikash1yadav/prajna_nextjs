import Enquiry from '../models/enquiry.js';

class EnquiryRepository {
  async get(id = null) {
    if (id !== null) {
      return await Enquiry.findByPk(id);
    }
    return await Enquiry.findAll({
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await Enquiry.update(updateData, { where: { id } });
      return id;
    } else {
      const record = await Enquiry.create(data);
      return record.id;
    }
  }

  async remove(id) {
    return await Enquiry.destroy({ where: { id } });
  }
}

export default EnquiryRepository;
