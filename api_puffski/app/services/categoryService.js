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

static async getCategoriesByType(type) {
    const query = {
      status: 'active',
      isDeleted: false,
      type: type,
    };

    const fields = { name: 1 }; 
    const sort = { name: 1 }; 

    const categories = await db.Category.find(query, fields).sort(sort);

    return categories;
  }

static async getItemCategories({ search, sortBy, page = 1, count = 10 }) {
 
    const query = {
      isDeleted: false,
      dataType: 'import',
      name: { $nin: ['Hybrid', 'Indica', 'Sativa'] },
    };


    if (search) {
      query.name = { $regex: search, $options: 'i' }; 
    }


    let sortObj = {};
    if (sortBy) {
      const [field, order] = sortBy.split(' ');
      sortObj[field || 'createdAt'] = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1;
    }

    
    const pageNumber = parseInt(page);
    const pageSize = parseInt(count);
    const skipNo = (pageNumber - 1) * pageSize;

  
    const total = await db.Itemcategory.countDocuments(query);


    const catData = await db.Itemcategory.find(query)
      .populate('instaleaf_categoryId')
      .sort(sortObj)
      .skip(skipNo)
      .limit(pageSize);

  
    const resultData = catData.map((cat) => ({
      _id: cat.name,
      id: cat._id,
      image: cat.image || '',
      name: cat.name,
      instaleaf_categoryId: cat.instaleaf_categoryId || null,
      hideProducts: cat.hideProducts,
      createdAt: cat.createdAt,
    }));

    return { itemCategory: resultData, total };
  }

 
static async getItemCategoryList({
  search = '',
  sortBy = '',
  page = 1,
  count = 10,
}) {
  const limit = Number(count);
  const currentPage = Number(page);
  const skip = (currentPage - 1) * limit;

  const query = {
    isDeleted: false,
    dataType: 'import',
    name: { $nin: ['Hybrid', 'Indica', 'Sativa'] },
  };

  if (search?.trim()) {
    query.$or = [
      {
        name: { $regex: search.trim(), $options: 'i' },
      },
    ];
  }


  let sortQuery = { createdAt: -1 };

  if (sortBy) {
    const [field, order] = sortBy.split(' ');
    sortQuery = {
      [field || 'createdAt']: order === 'asc' ? 1 : -1,
    };
  }

  const [total, categories] = await Promise.all([
    db.ItemCategory.countDocuments(query),
    db.ItemCategory.find(query)
      .populate({
        path: 'instaleaf_categoryId',
        select: 'name image',
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const itemCategory = categories.map((item) => ({
    _id: item.name,              // keeping legacy behavior
    id: item._id,
    image: item.image ?? '',
    name: item.name,
    instaleaf_categoryId: item.instaleaf_categoryId ?? null,
    hideProducts: item.hideProducts ?? false,
    createdAt: item.createdAt,
  }));

  return {
    itemCategory,
    total,
    page: currentPage,
    count: limit,
  };
}


static async getMainCategoriesWithSubcategories({
  search,
  sortBy = 'createdAt desc',
  page = 1,
  count = 10,
}) {
  const skip = (page - 1) * count;

  const mainQuery = {
    isMaster: true,
    isDeleted: false,
  };

  const searchQuery = {};
  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await db.Category.countDocuments(mainQuery);

  const categories = await db.Category.find(mainQuery)
    .sort(sortBy)
    .skip(skip)
    .limit(count)
    .lean();

  const resultData = await Promise.all(
    categories.map(async (cat) => {
      const subCategories = await Itemcategory.find({
        instaleaf_categoryId: cat._id,
      }).lean();

      return {
        id: cat._id,
        name: cat.name,
        image: cat.image || '',
        subCategories: subCategories || [],
        type: cat.type,
        status: cat.status,
        isDeleted: cat.isDeleted,
        createdAt: cat.createdAt,
      };
    })
  );

  return {
    itemCategory: resultData,
    total,
  };
}

static  async  updateMasterCategoryService({ id, isMaster }) {
  const category = await db.Category.findById({ _id:id });

  if (!category) {
    const error = new Error('Category not found.');
    error.statusCode = 404;
    throw error;
  }

  category.isMaster = isMaster;
  await category.save();

  return category;


}


static async getMasterCategoriesService({
  search,
  sortBy = 'createdAt desc',
  page = 1,
  count = 10,
  type,
}) {
  const skip = (page - 1) * count;

  const query = {
    isDeleted: false,
    isMaster: true,
  };

  if (type) {
    query.type = type;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const total = await db.Category.countDocuments(query);

  const masterCategories = await db.Category.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(count)
    .lean();

  return {
    masterCategories,
    total,
  };
}
   static async  getProducerCategoriesService({
  producer_id,
  search,
  sortBy = 'createdAt',
  page = 1,
  count = 10,
  type,
}) {
  const skip = (page - 1) * count;

  const query = { isDeleted: false };

  if (type) query.type = type;
  if (producer_id) query.instaleaf_producerId = producer_id;
  if (search) {
    // Modern MongoDB regex search
    query.name = { $regex: search, $options: 'i' };
  }

  const total = await Category.countDocuments(query);

  const categories = await Category.find(query)
    .populate('instaleaf_producerId') // populate producer details
    .sort(sortBy)
    .skip(skip)
    .limit(count)
    .lean();

  return { categories, total };
}




// producer.service.js
static async getProducerCategoriesWithProductService  (producerId) {
  // 1. Fetch categories
  const categories = await db.Category.find({
    isDeleted: false,
    type: 'product',
    instaleaf_producerId: producerId,
  });

  if (!categories.length) {
    return [];
  }

  // 2. Fetch producer
  const producer = await db.Item.findOne({ id: producerId });

  if (!producer?.name) {
    return [];
  }

  // 3. Check products for each category (parallel execution)
  const filteredCategories = await Promise.all(
    categories.map(async (category) => {
      const productQuery = {
        isDeleted: false,
        quantity: { $gt: 2 },
        instaleaf_producerName: { $exists: true },
        $or: [
          {
            instaleaf_producerName: {
              like: `%${producer.name}%`,
            },
          },
          {
            supplierName: {
              like: `%${producer.name}%`,
            },
          },
          { producer_category_id: category.id },
          { instaleaf_categoryId: category.id },
        ],
      };

      const products = await db.Itemproduct.find(productQuery).limit(1);

      return products.length > 0 ? category : null;
    })
  );

  // 4. Remove null values
  return filteredCategories.filter(Boolean);
};

}




module.exports = CategoryService;
