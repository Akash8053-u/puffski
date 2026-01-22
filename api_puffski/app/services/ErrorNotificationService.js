const db = require("../models/index");

const createErrorNotification = async (data) => {
  return await db.ErrorNotification.create(data);
};

module.exports = {
  createErrorNotification,
};
