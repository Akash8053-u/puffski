const service = require("../services");

// const {
//   createErrorNotificationSchema,
// } = require("../validations/errorNotification.validation");
const MESSAGES = require("../utils/constants");

const saveErrorNotifications = async (req, res) => {
  try {
    // // 🔹 Joi validation
    // const { error, value } =
    //   createErrorNotificationSchema.validate(req.body);

    // if (error) {
    //   return res.status(422).json({
    //     success: false,
    //     message: error.details[0].message,
    //   });
    // }

    // 🔹 Create record
    const errorData = await service.ErrorNotificationService(req.body);

    return res.status(201).json({
      success: true,
      data: errorData,
      message: MESSAGES.ERROR_NOTIFICATION_CREATED,
    });
  } catch (err) {
    console.error("saveErrorNotifications error:", err);

    return res.status(500).json({
      success: false,
      message: MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = {
  saveErrorNotifications,
};
