const service = require('../services/index')
const db = require('../models/index')

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
      req.params.id,
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
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const sortBy = req.query.sortBy || '-createdAt';

    const categories = await db.Category.find({
      isDeleted: false,
      status: 'active',
    }).sort(sortBy);

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};
