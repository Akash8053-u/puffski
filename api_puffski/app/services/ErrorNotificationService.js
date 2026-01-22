const db = require("../models/index");

const createErrorNotification = async (data) => {
  return await db.ErrorNotification.create(data);
};

const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

const getAllErrorNotificationsService = async (params) => {
  const {
    page,
    count,
    sortBy,
    search,
    addedBy,
    dispensaryId,
  } = params;

  const query = { isDeleted: false };
  const sortQuery = {};

  // Sorting
  if (sortBy) {
    const [field, order] = sortBy.split(" ");
    sortQuery[field] = order === "desc" ? -1 : 1;
  } else {
    sortQuery.createdAt = -1;
  }


  if (addedBy) {
    query.addedBy = new ObjectId(addedBy);
  }

  if (dispensaryId) {
    query.store = dispensaryId;
  }

  if (search) {
    query.$or = [
      { reason: { $regex: search, $options: "i" } },
      { store: { $regex: search, $options: "i" } },
      { "userDetail.fullName": { $regex: search, $options: "i" } },
      { "userDetail.email": { $regex: search, $options: "i" } },
      { "userDetail.username": { $regex: search, $options: "i" } },
      { "userDetail.username1": { $regex: search, $options: "i" } },
    ];
  }

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "userDetail",
      },
    },
    {
      $unwind: {
        path: "$userDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: "$_id",
        reason: 1,
        store: 1,
        addedBy: 1,
        isDeleted: 1,
        createdAt: 1,

        name: "$userDetail.fullName",
        email: "$userDetail.email",
        phone: "$userDetail.mobile",
        username: "$userDetail.username",
        username1: "$userDetail.username1",
        registeredDate: "$userDetail.date_registered",
      },
    },
    { $match: query },
  ];

  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await db.ErrorNotification.aggregate(countPipeline);
  const total = countResult.length ? countResult[0].total : 0;

  if (page && count) {
    const skip = (Number(page) - 1) * Number(count);
    pipeline.push(
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: Number(count) }
    );
  } else {
    pipeline.push({ $sort: sortQuery });
  }

  const results = await db.ErrorNotification.aggregate(pipeline);

  return {
    data: results,
    total,
  };
};


module.exports = {
  createErrorNotification,getAllErrorNotificationsService
};
