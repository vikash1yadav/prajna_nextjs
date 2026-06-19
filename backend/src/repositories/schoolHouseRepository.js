import SchoolHouse from '../models/schoolHouse.js';

class SchoolHouseRepository {
  async get(id = null) {
    if (id !== null) {
      return await SchoolHouse.findByPk(id);
    }
    return await SchoolHouse.findAll({
      order: [['id', 'ASC']]
    });
  }

  async add(data) {
    if (data.id) {
      const { id, ...updateData } = data;
      await SchoolHouse.update(updateData, { where: { id } });
      return id;
    } else {
      const houseObj = await SchoolHouse.create(data);
      return houseObj.id;
    }
  }

  async remove(id) {
    return await SchoolHouse.destroy({ where: { id } });
  }
}

export default SchoolHouseRepository;
