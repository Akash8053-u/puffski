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


   static async listCategories(portal) {
    const sortBy = { name: 1 }; 
    const fields = { name: 1 }; 
    const query = { status: 'active', isDeleted: false };

    if (portal) {
      query.instaleaf_producerId = { $exists: false };
    }

  
    const categories = await db.Category.find(query, fields).sort(sortBy);
    return categories;
  }





  
  static async getAllCategories({ search, sortBy, page, count, filter }) {
    const query = { isDeleted: false };


    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (filter === 'producer') {
      query.instaleaf_producerId = { $exists: true };
    } else if (filter === 'store') {
      query.instaleaf_producerId = { $exists: false };
    } else if (filter === 'admin') {
      query.name = {
        $in: [
          'Flower',
          'Edibles',
          'Beverages',
          'Pre-Roll',
          'Concentrates',
          'Topicals',
          'Vapes',
          'Oils',
          'Seeds',
          'Capsules',
          'accessories',
        ],
      };
    }

   
    let sortObj = {};
    if (sortBy) {
      const [field, order] = sortBy.split(' ');
      sortObj[field] = order === 'desc' ? -1 : 1;
    } else {
      sortObj['createdAt'] = -1;
    }

   
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(count) || 10;
    const skipNo = (pageNumber - 1) * pageSize;

    const total = await db.Category.countDocuments(query);
    const categories = await db.Category.find(query)
      .populate('instaleaf_producerId')
      .sort(sortObj)
      .skip(skipNo)
      .limit(pageSize);

    return { categories, total };
  
}




}

module.exports = CategoryService;
