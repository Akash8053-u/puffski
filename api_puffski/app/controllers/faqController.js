// controllers/faq.controller.js
const db = require('../models/index');
const mongoose = require('mongoose');

module.exports = {

  // CREATE FAQ
  create: async (req, res) => {
    try {
      const data = req.body;
      if (!data.question || !data.answer || !data.category) {
        return res.status(400).json({ success: false, error: { code: 400, message: "Payload missing" } });
      }

      const exists = await db.Faq.findOne({ question: data.question, category: data.category, isDeleted: false });
      if (exists) {
        return res.status(400).json({ success: false, error: { code: 400, message: "FAQ already exists" } });
      }

      await db.Faq.create(data);
      return res.status(200).json({ success: true, message: "FAQ created successfully" });

    } catch (err) {
      return res.status(400).json({ success: false, error: { code: 400, message: "" + err } });
    }
  },

  // GET SINGLE FAQ DETAIL
  detail: async (req, res) => {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ success: false, error: { code: 400, message: "FAQ id missing" } });

      const faq = await db.Faq.findById(id);
      return res.status(200).json({ success: true, data: faq });

    } catch (err) {
      return res.status(400).json({ success: false, error: { code: 400, message: "" + err } });
    }
  },

  // UPDATE FAQ
  update: async (req, res) => {
    try {
      const data = req.body;
      if (!data.id) return res.status(400).json({ success: false, error: { code: 400, message: "FAQ id missing" } });

      const exists = await db.Faq.findOne({ question: data.question, category: data.category, _id: { $ne: data.id }, isDeleted: false });
      if (exists) {
        return res.status(400).json({ success: false, error: { code: 400, message: "FAQ already exists" } });
      }

      await db.Faq.findByIdAndUpdate(data.id, data, { new: true });
      return res.status(200).json({ success: true, message: "FAQ updated successfully" });

    } catch (err) {
      return res.status(400).json({ success: false, error: { code: 400, message: "" + err } });
    }
  },

  // LIST ALL FAQS
  listing: async (req, res) => {
    try {
      let { page = 1, count = 10, search, category, status, isFav, sortBy } = req.query;
      page = Number(page);
      count = Number(count);
      const skip = (page - 1) * count;

      let query = { isDeleted: false };

      if (search) {
        query.$or = [
          { question: { $regex: search, $options: 'i' } },
          { answer: { $regex: search, $options: 'i' } }
        ];
      }
      if (category) query.category = category;
      if (status) query.status = status;
      if (isFav === 'true') query.isFav = true;
      if (isFav === 'false') query.isFav = false;

      // Sorting
      let sort = {};
      if (sortBy) {
        const [field, order] = sortBy.split(" ");
        sort[field || "createdAt"] = order === 'desc' ? -1 : 1;
      } else {
        sort = { updatedAt: -1 };
      }

      const total = await db.Faq.countDocuments(query);
      const data = await db.Faq.find(query).sort(sort).skip(skip).limit(count);

      return res.status(200).json({ success: true, total, data });

    } catch (err) {
      return res.status(400).json({ success: false, error: { code: 400, message: "" + err } });
    }
  }

};

