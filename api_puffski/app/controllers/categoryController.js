const service = require("../services/index");
const db = require("../models/index");
const constant = require('../utils/constants')
exports.create = async (req, res, next) => {
  try {
    const category = await service.Categoryservice.saveCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    console.log("hello master");

    const category = await service.Categoryservice.updateCategory(
      req.body.id,
      req.body
    );
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.Categoryservice.deleteCategory(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const portal = req.query.portal;
    const categories = await service.Categoryservice.listCategories(portal);

    res.json({
      success: true,
      data: {
        category: categories,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { search, sortBy, page, count, filter } = req.query;

    const result = await service.Categoryservice.getAllCategories({
      search,
      sortBy,
      page,
      count,
      filter,
    });

    res.json({
      success: true,
      data: {
        category: result.categories,
        total: result.total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      error: { code: 400, message: err.message || "Something went wrong" },
    });
  }
};



exports.categoryByType = async (req, res, next) => {
  try {
    const { type } = req.params;

    const categories = await service.Categoryservice.getCategoriesByType(type);

    res.json({
      success: true,
      data: {
        newscat: categories,
      },
    });
  } catch (err) {
    console.error(err);
    next(err); // pass to Express error handler
  }
};



exports.itemCategoryList = async (req, res) => {
  try {
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || '';
    const page = parseInt(req.query.page, 10) || 1;
    const count = parseInt(req.query.count, 10) || 10;

    const data = await service.Categoryservice.getItemCategoryList  ({
      search,
      sortBy,
      page,
      count,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || error,
    });
  }
};
exports.mainCategoryWithSubcategory= async(req, res)=> {
  try {
    const {
      search,
      sortBy,
      page = 1,
      count = 10,
    } = req.query;

    const data = await service.Categoryservice.getMainCategoriesWithSubcategories({
      search,
      sortBy,
      page: Number(page),
      count: Number(count),
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Category Controller Error:', error);

    return res.status(400).json({
      success: false,
      error: error.message || error,
    });
  }
}




exports.updateMasterCategory=async(req, res)=> {
  try {
    const { id, isMaster } = req.body; 


    if (typeof isMaster === 'undefined') {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'isMaster is required',
        },
      });
    }

    const updatedCategory = await service.Categoryservice.updateMasterCategoryService({
      id,
      isMaster,
    });

    return res.status(200).json({
      success: true,
      code: 200,
      data: {
        updatedCategory,
        message: constant.category.UPDATED_CATEGORY,
      },
    });
  } catch (error) {
    console.error('Update Master Category Error:', error);

    return res.status(error.statusCode || 400).json({
      success: false,
      error: {
        code: error.statusCode || 400,
        message: error.message || error,
      },
    });
  }
}




exports. masterCategoriesList= async(req, res)=> {
  try {
    const {
      search,
      sortBy,
      page = 1,
      count = 10,
      type,
    } = req.query;

    const data = await service.Categoryservice.getMasterCategoriesService({
      search,
      sortBy,
      page: Number(page),
      count: Number(count),
      type,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Master Categories List Error:', error);

    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: error.message || error,
      },
    });
  }
}


exports.getProducerCategories= async(req, res)=> {
  try {
    const {
      producer_id,
      search,
      sortBy,
      page = 1,
      count = 10,
      type,
    } = req.query;

    const data = await service.Categoryservice.getProducerCategoriesService({
      producer_id,
      search,
      sortBy,
      page: Number(page),
      count: Number(count),
      type,
    });

    return res.json({
      success: true,
      data: data.categories,
      total: data.total,
    });
  } catch (error) {
    console.error('Get Producer Categories Error:', error);
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: error.message || 'Something went wrong',
      },
    });
  }
}



exports.getProducerCategoriesWithProduct = async (req, res) => {
  try {
    const { producer_id } = req.params; 

    if (!producer_id) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: 'producer_id is required' },
      });
    }

    const categories = await service.Categoryservice.getProducerCategoriesWithProductService(producer_id);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: error.message },
    });
  }
};




exports.getProducerCategoriesWithProduct = async (req, res) => {
  try {
    const { producer_id } = req.params;

    if (!producer_id) {
      return res.status(400).json({
        success: false,
        message: "producer_id is required"
      });
    }

    const categories =
      await service.Categoryservice.getProducerCategoriesWithProduct(producer_id);

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
