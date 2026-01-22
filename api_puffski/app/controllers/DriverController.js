const DriverService = require('../services/DriverService');

class DriverController {
  async sendNotify(req, res) {
    try {
      const driver = await Users.findOne({ id: "5ce4473e005fe5581c69f384" });
      FirebaseService.sendFireBaseNotificationArray({
        push_token_array: driver.push_token_array,
        token: driver.push_token,
        notification: 'You have a new order.',
        domain: driver.domain,
        id: "5ce4473e005fe5581c69f384",
      });

      return res.status(200).json({
        success: true,
        message: "Notification sent successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message || error }
      });
    }
  }

  async checkEmail1(req, res) {
    try {
      // This appears to be a test method
      const testData = {
        "_id": ObjectId("66664a478fa45f75799ff458"),
        // ... [keep all the test data as in original]
      };
      
      await DriverService.paymentReserveEmail(
        testData,
        "chandra@yopmail.com",
        "",
        "chander",
        "Ogden Cannabis",
        "2130 Glenmore Ct SE, Calgary, Canada"
      );
      
      return res.status(200).json({
        success: true,
        message: "Email test executed"
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async addDriver(req, res) {
    try {
      const data = req.body;
      const result = await DriverService.addDriver(data);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async driverDetail(req, res) {
    try {
      const id = req.param('id');
      const driver = await Users.findOne({ id: id });
      
      return res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async updateDriver(req, res) {
    try {
      const id = req.param('id');
      const data = req.body;

      const updatedDriver = await Users.update({ id: id }, data);

      return res.status(200).json({
        success: true,
        data: updatedDriver,
        message: constantObj.driver.UPDATED,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async getStoreDriver(req, res) {
    try {
      const queryParams = {
        search: req.param('search'),
        sortBy: req.param('sortBy'),
        page: parseInt(req.param('page')) || 1,
        count: parseInt(req.param('count')) || 10,
        status: req.param('status'),
        addedBy: req.param('addedBy'),
        city: req.param('city'),
        commonCourier: req.param('commonCourier')
      };

      const result = await DriverService.getStoreDriver(queryParams);
      
      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async assignOrder(req, res) {
    try {
      const data = req.body;
      const result = await DriverService.assignOrder(data);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async assignMultipleOrder(req, res) {
    try {
      const data = req.body;
      const result = await DriverService.assignMultipleOrder(data);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async updateOrderData(req, res) {
    try {
      const id = req.param('id');
      const data = req.body;
      
      const updatedOrder = await Reserveorders.update({ id: id }, data);
      
      return res.status(200).json({
        success: true,
        data: updatedOrder,
        message: constantObj.orders.UPDATED_ORDER,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async getSotresList(req, res) {
    try {
      const { search } = req.query;
      let query = {};
      query.isDeleted = false;
      query.roles = 'D';
      query.status = 'active';
      
      if (search) {
        query.$or = [
          { fullName: { like: '%' + search + '%' } },
          { email: { like: '%' + search + '%' } },
          { username1: { like: '%' + search + '%' } },
        ];
      }

      Users.native(function(err, users) {
        users.aggregate([
          { $match: query },
          {
            $project: {
              id: '$_id',
              firstName: '$firstName',
              fullName: '$fullName',
              username: '$username',
              username1: '$username1',
              lowerCaseName: { $toLower: '$username1' },
              status: '$status',
              isCommonCourier: { $ifNull: ['$isCommonCourier', false] },
              commonCourier: { $ifNull: ['$commonCourier', false] },
              isDeleted: '$isDeleted',
              createdAt: '$createdAt',
            },
          },
          { $sort: { lowerCaseName: 1 } }
        ], function(errq, results) {
          if (errq) {
            return res.status(400).json({
              success: false,
              error: { code: 400, message: errq.message || errq }
            });
          } else {
            return res.status(200).json({
              success: true,
              data: results,
            });
          }
        });
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async signinDriver(req, res) {
    try {
      const data = req.body;
      const user = await DriverService.signinDriver(data);
      
      return res.status(200).json({
        success: true,
        code: 200,
        message: constantObj.messages.SUCCESSFULLY_LOGGEDIN,
        data: user,
      });
    } catch (err) {
      console.error(err);
      
      let errorResponse = {
        success: false,
        error: { code: 400, message: err.message || err }
      };

      // Handle specific error cases
      if (err.message === constantObj.messages.USERNAME_REQUIRED ||
          err.message === constantObj.messages.PASSWORD_REQUIRED ||
          err.message === constantObj.messages.WRONG_USERNAME ||
          err.message === constantObj.messages.WRONG_PASSWORD ||
          err.message === constantObj.messages.USERNAME_INACTIVE) {
        errorResponse.error.code = 404;
      }

      return res.status(errorResponse.error.code).json(errorResponse);
    }
  }

  async driverFrorgotPassword(req, res) {
    try {
      const data = req.body;
      const result = await DriverService.driverForgotPassword(data.username);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      
      let errorResponse = {
        success: false,
        error: { code: 400, message: err.message || err }
      };

      if (err.message === constantObj.messages.USERNAME_REQUIRED ||
          err.message === constantObj.messages.WRONG_USERNAME) {
        errorResponse.error.code = 404;
      }

      return res.status(errorResponse.error.code).json(errorResponse);
    }
  }

  async getDriverPendingOrders(req, res) {
    try {
      const driver_id = req.param('driver_id');
      const queryParams = {
        search: req.param('search'),
        sortBy: req.param('sortBy') ? req.param('sortBy') : "order asc",
        page: parseInt(req.param('page')) || 1,
        count: parseInt(req.param('count')) || 10
      };

      const result = await DriverService.getDriverPendingOrders(driver_id, queryParams);
      
      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async orderStatusChange(req, res) {
    try {
      const data = req.body.orderArray;
      
      if (data && data.length > 0) {
        for (const singleResult of data) {
          await Reserveorders.update(
            { id: singleResult.id },
            { order: singleResult.order }
          );
        }
      } else if (req.body.id) {
        await Reserveorders.update(
          { id: req.body.id },
          { order: req.body.order }
        );
      }
      
      return res.status(200).json({
        success: true,
        message: `Order position updated successfully.`,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async getDriverAcceptedOrders(req, res) {
    try {
      const driver_id = req.param('driver_id');
      const queryParams = {
        search: req.param('search'),
        sortBy: req.param('sortBy'),
        page: parseInt(req.param('page')) || 1,
        count: parseInt(req.param('count')) || 10
      };

      const result = await DriverService.getDriverAcceptedOrders(driver_id, queryParams);
      
      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async getDriverDeliveredOrders(req, res) {
    try {
      const driver_id = req.param('driver_id');
      const queryParams = {
        search: req.param('search'),
        sortBy: req.param('sortBy'),
        page: parseInt(req.param('page')) || 1,
        count: parseInt(req.param('count')) || 10,
        start: req.param('start'),
        end: req.param('end')
      };

      const result = await DriverService.getDriverDeliveredOrders(driver_id, queryParams);
      
      return res.status(200).json({
        success: true,
        totalEarning: result.totalEarning,
        data: result.data,
        total: result.total,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async acceptRejectOrder(req, res) {
    try {
      const id = req.param('id');
      const driver_id = req.param('driver_id');
      const status = req.param('status');
      
      const result = await DriverService.acceptRejectOrder(id, driver_id, status);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async markAsDeliver(req, res) {
    try {
      const id = req.param('id');
      const result = await DriverService.markAsDeliver(id, req.identity.id);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async updateOrderByDriver(req, res) {
    try {
      const order_ids = req.body.order_ids;
      const status = req.body.status;
      
      const result = await DriverService.updateOrderByDriver(order_ids, status, req.identity.id);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async verifyId(req, res) {
    try {
      const data = req.body;
      const id = data.id;
      delete data.id;
      
      await Reserveorders.update({ id: id }, data);
      
      return res.status(200).json({
        success: true,
        message: 'Order updated successfully.',
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async changeDriver(req, res) {
    try {
      const data = req.body;
      const id = data.id;
      delete data.id;
      
      await Reserveorders.update({ id: id }, data);
      
      return res.status(200).json({
        success: true,
        message: 'Order updated successfully.',
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async declineOrder(req, res) {
    try {
      const data = req.body;

      if (!data.id) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: 'Payload missing.' },
        });
      }
      
      const reserveorder = await Reserveorders.findOne({ id: data.id });
      
      await Reserveorders.update(
        { id: data.id },
        { order_status: 'Declined', reason: data.reason }
      );
      
      const user = await Users.findOne({ id: reserveorder.addedBy });
      
      await DriverService.emailToCustomer({
        email: user.email,
        order_number: reserveorder.order_number,
        reason: data.reason,
      });

      return res.status(200).json({
        success: true,
        message: 'Order declined successfully.'
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async reSendOrderToDriver(req, res) {
    try {
      const id = req.param('id');
      const order = await Reserveorders.findOne({ id: id }).populate('dispensary_id');
      
      const dataToUpdate = {
        order_status: 'Accepted',
        driver_request_status: 'pending',
        status: 'active'
      };
      
      await Reserveorders.update({ id: id }, dataToUpdate);
      
      const driver = await Users.findOne({ id: order.driver });
      
      await DriverService.orderEmail(
        driver.email,
        order.order_number,
        driver.firstName ? driver.firstName : driver.username,
        order.dispensary_id.name
      );

      return res.status(200).json({
        success: true,
        message: 'Order resend to driver successfully.',
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async addDriverStatus(req, res) {
    try {
      const data = req.body;
      const result = await DriverService.addDriverStatus(data);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async updateDriverStatus(req, res) {
    try {
      const data = req.body;
      const result = await DriverService.updateDriverStatus(data.id, data.scheduleStatus);
      
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }

  async getDriverStatus(req, res) {
    try {
      const driverId = req.param("driverId");
      const result = await DriverService.getDriverStatus(driverId);
      
      return res.status(200).json({
        success: true,
        data: result,
        message: "Data fetched successfully.",
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message || err }
      });
    }
  }
}

module.exports = new DriverController();