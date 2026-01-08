const mongoose = require('mongoose');
const db=require('../models/index')
//const constants = require('../config/constants');

module.exports = {


  async getName(req, res) {
    try {
      const data = await db.Subscribename.find({});
      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  
  async getNameDetails(req, res) {
    try {
      const { id } = req.params;
      const data = await db.Subscribename.findById(id);

      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  // ✅ POST /subscribename
  async saveName(req, res) {
    try {
      const data = {
        ...req.body,
        addedBy: req.user.id
      };

      const result = await db.Subscribename.create(data);

      return res.status(200).json({
        success: true,
        data: result,
       // message: constants.messages.SNAME_SAVE
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  // ✅ PUT /subscribename
  async updateName(req, res) {
    try {
      const { id } = req.body;

      const data = {
        ...req.body,
        addedBy: req.user.id
      };

      const result = await db.Subscribename.findByIdAndUpdate(
        id,
        data,
        { new: true }
      );

      return res.status(200).json({
        success: true,
        data: result,
       //// message: constants.messages.SNAME_SAVE
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  // ✅ GET /subscribenameall
  async getAllName(req, res) {
    try {
      const {
        search,
        sortBy = 'createdA.t',
        page = 1,
        count = 10
      } = req.query;

      const skip = (page - 1) * count;

      const query = { isDeleted: false };

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const total = await db.Subscribename.countDocuments(query);

      const data = await Subscribename
        .find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(Number(count));

      return res.status(200).json({
        success: true,
        data: {
          category: data,
          total
        }
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

};
