const service = require("../services/index");
const db = require("../models/index");

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
