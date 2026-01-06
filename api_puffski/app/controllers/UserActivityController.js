const mongoose = require("mongoose");
const UserActivity = require("../models/UserActivity");



module.exports = {


  async saveUserActivity(req, res) {
    try {
      const activity = await UserActivity.create(req.body);

      return res.status(201).json({
        success: true,
        data: activity,
        message: "Activity added successfully"
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  },

 
  async getAllUserActivity(req, res) {
    try {
      const {
        page = 1,
        count = 10,
        sortBy = "createdAt desc",
        search,
        addedBy,
        dispensaryId
      } = req.query;

      const [sortField, sortOrder] = sortBy.split(" ");
      const sort = {
        [sortField || "createdAt"]: sortOrder === "asc" ? 1 : -1
      };

      const match = { isDeleted: false };

      if (addedBy && isValidObjectId(addedBy)) {
        match.addedBy = new ObjectId(addedBy);
      }

      if (dispensaryId) {
        match.store = dispensaryId;
      }

      if (search) {
        match.$or = [
          { productName: new RegExp(search, "i") },
          { brand: new RegExp(search, "i") },
          { sku: new RegExp(search, "i") },
          { store: new RegExp(search, "i") }
        ];
      }

      const skip = (Number(page) - 1) * Number(count);
      const limit = Number(count);

      const pipeline = [
        { $match: match },

        {
          $lookup: {
            from: "users",
            localField: "addedBy",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        {
          $project: {
            productName: 1,
            brand: 1,
            sku: 1,
            store: 1,
            price: 1,
            quantity: 1,
            createdAt: 1,

            user: {
              _id: "$user._id",
              name: "$user.fullName",
              email: "$user.email",
              username: "$user.username"
            }
          }
        },

        {
          $facet: {
            data: [
              { $sort: sort },
              { $skip: skip },
              { $limit: limit }
            ],
            total: [
              { $count: "count" }
            ]
          }
        }
      ];

      const [result] = await UserActivity.aggregate(pipeline);

      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total[0]?.count || 0,
        page: Number(page),
        count: limit
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

 
  async detail(req, res) {
    try {
      const { id } = req.query;

  

      const activity = await UserActivity
        .findById(id)
       

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: "Activity not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: activity
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
};
