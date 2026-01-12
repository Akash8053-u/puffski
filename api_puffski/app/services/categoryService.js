const db = require('../models/index');
const constants = require('../utils/constants');

class CategoryService {
  static async saveCategory(data) {
    if (!data.name) {
      throw new Error(constants.category.NAME_REQUIRED);
    }

    const exists = await db.Category.findOne({
      name: data.name,
      isDeleted: false,
      status: 'active',
    });

    if (exists) {
      throw new Error(constants.category.CATEGORY_ALREADY_EXIST);
    }

    return await db.Category.create(data);
  }

  static async updateCategory(id, data) {
    const exists = await db.Category.findOne({
      name: data.name,
      _id: { $ne: id },
      isDeleted: false,
    });

    if (exists) {
      throw new Error(constants.category.CATEGORY_ALREADY_EXIST);
    }

    return await db.Category.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteCategory(id) {
    return await db.Category.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }

  static async list(query, sortBy) {
    return await db.Category.find(query).sort(sortBy);
  }
}

module.exports = CategoryService;
