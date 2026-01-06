const db = require('../models/index')

module.exports = {

  // Track website visit
  async visitWebsite(req, res) {
    try {
      // Get real client IP (supports proxies/load balancers)
      const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        req.ip;

      const { type, domain, app_type } = req.body;

      const viewQuery = {
        ipAddress,
        type,
        domain
      };

      if (app_type) {
        viewQuery.app_type = app_type;
      }

      await db.WebsiteViewed.create(viewQuery);

      return res.status(200).json({
        success: true,
        code: 200
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: err.message
      });
    }
  }

};
