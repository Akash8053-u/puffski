const service = require("../services/index");
const db = require("../models/index");

const MESSAGES = require("../utils/constants");



exports.saveErrorNotifications = async (req, res) => {
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



exports.detail= async (req, res)=>{
        try{
            const id = req.query.id;

            const detail = await db.ErrorNotification.findById({_id:id}).populate('addedBy')

            return res.status(200).json({
                success:true,
                data:detail
            })
        }catch(err){
            return res.status(400).json({
                success:false,
                error:{code:400,message:""+err}
            })
        }
    }



exports. getAllErrorNotifications = async (req, res) => {
  try {
    const result = await service.ErrorNotificationService.getAllErrorNotificationsService(req.query);

    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message,
      },
    });
  }
};
