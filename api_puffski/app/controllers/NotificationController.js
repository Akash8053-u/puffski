/**
 * NotificationController
 */

const mongoose = require('mongoose');
const db = require('../models/index'); // adjust path
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
  getAllNotifications: async function (req, res) {
    try {
      const page = parseInt(req.query.page || 1);
      const count = parseInt(req.query.count || 10);
      const skipNo = (page - 1) * count;

      let sortBy = req.query.sortBy || { createdAt: -1 };

      const userId = new ObjectId(req.identity.id);

      const matchStage = {
        to: userId,
      };

      /** AGGREGATION PIPELINE */
      const pipeline = [
        { $match: matchStage },

        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product_id',
          },
        },
        {
          $lookup: {
            from: 'reserveorders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'orderId',
          },
        },
        { $unwind: { path: '$product_id', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$orderId', preserveNullAndEmptyArrays: true } },

        { $sort: sortBy },
        { $skip: skipNo },
        { $limit: count },
      ];

      const notifications = await db.notifications.aggregate(pipeline);

      /** TOTAL COUNT */
      const total = await db.notifications.countDocuments(matchStage);

      /** UNREAD COUNT */
      const totalUnread = await db.notifications.countDocuments({
        ...matchStage,
        readStatus: false,
      });

      return res.status(200).json({
        success: true,
        data: {
          notifications,
          total,
          totalUnread,
        },
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: String(err),
        },
      });
    }
  },

  updateReadStatus: async function (req, res) {
    try {
      const id = req.params.id;

      await db.notifications.updateOne(
        {
          _id: new ObjectId(id),
          readStatus: false,
        },
        {
          $set: { readStatus: true },
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Read status updated.',
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: String(err),
        },
      });
    }
  },
};
