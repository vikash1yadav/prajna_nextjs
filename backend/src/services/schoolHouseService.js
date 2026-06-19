import SchoolHouseRepository from '../repositories/schoolHouseRepository.js';

class SchoolHouseService {
  constructor() {
    this.schoolHouseRepository = new SchoolHouseRepository();
  }

  async getHouses(id = null) {
    return await this.schoolHouseRepository.get(id);
  }

  async saveHouse(houseData) {
    if (!houseData.house_name || houseData.house_name.trim() === '') {
      throw new Error('House name is required');
    }
    // Set is_active to 'yes' if not set
    if (!houseData.is_active) {
      houseData.is_active = 'yes';
    }
    // Set default description if empty/null (avoid null errors if db requires it)
    if (houseData.description === undefined || houseData.description === null) {
      houseData.description = '';
    }
    return await this.schoolHouseRepository.add(houseData);
  }

  async deleteHouse(id) {
    if (!id) {
      throw new Error('House ID is required');
    }
    return await this.schoolHouseRepository.remove(id);
  }
}

export default SchoolHouseService;
