const service = require("../services/index");


const MESSAGES = require("../utils/constants");



const saveErrorNotifications = async (req, res) => {
  try {
    const data = req.body;

    const errorData = await service.ErrorNotificationService.createErrorNotification(data);

    return res.status(200).json({
      success: true,
      code: 200,
      data: errorData,
      message: MESSAGES.ERROR_NOTIFICATION_CREATED,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: `${MESSAGES.ERROR_NOTIFICATION_FAILED}: ${error.message}`,
      },
    });
  }
};

module.exports = {
  saveErrorNotifications,
};
