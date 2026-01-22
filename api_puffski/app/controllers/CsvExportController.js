
const { ObjectId } = require('mongodb');
const excel = require('exceljs');
const async = require('async');

module.exports = {
  webdateuserExcel: async (req, res) => {
    try {
      const query = {
        roles: 'U',
        isDeleted: false,
        usersloginCount: 0,
        createdAt: {
          $gte: new Date("2023-05-05T00:00:00Z"),
          $lt: new Date("2023-05-06T00:00:00Z")
        }
      };

      const sortBy = 'createdAt desc';

      const users = await Users.find(query).sort(sortBy);
      const WebUsersData = [];

      users.forEach((obj) => {
        WebUsersData.push({
          firstName: obj.firstName || '-',
          lastName: obj.lastName || '-',
          fullName: obj.fullName || '-',
          email: obj.username || '-',
          userName: obj.username1,
          usersloginCount: obj.usersloginCount,
          status: obj.status,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('WebUsersData');

      worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 25 },
        { header: 'Last Name', key: 'lastName', width: 25 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email-Id', key: 'email', width: 25 },
        { header: 'Username', key: 'userName', width: 25 },
        { header: 'Login Count', key: 'usersloginCount', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registration Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(WebUsersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Users-Zero-Login-Attempt.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in webdateuserExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  webUserExcel: async (req, res) => {
    try {
      const query = {
        roles: 'U',
        isDeleted: false
      };

      const sortBy = 'createdAt desc';
      const users = await Users.find(query).sort(sortBy);
      const WebUsersData = [];

      users.forEach((obj) => {
        let gender = '-';
        if (obj.gender == 'F') {
          gender = 'Female';
        } else if (obj.gender == 'M') {
          gender = 'Male';
        }

        WebUsersData.push({
          firstName: obj.firstName || '-',
          lastName: obj.lastName || '-',
          fullName: obj.fullName || '-',
          email: obj.username || '-',
          userName: obj.username1,
          gender: gender,
          status: obj.status,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('WebUsersData');

      worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 25 },
        { header: 'Last Name', key: 'lastName', width: 25 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email-Id', key: 'email', width: 25 },
        { header: 'Username', key: 'userName', width: 25 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registration Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(WebUsersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Users.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in webUserExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  oneOrderUser: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        roles: 'U',
        isDeleted: false,
        totalOrder: { $gte: 1 }
      };

      const sortBy = 'createdAt desc';

      if (startDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const users = await Users.find(query).sort(sortBy);
      const WebUsersData = [];

      users.forEach((obj) => {
        let gender = '-';
        if (obj.gender == 'F') {
          gender = 'Female';
        } else if (obj.gender == 'M') {
          gender = 'Male';
        }

        WebUsersData.push({
          firstName: obj.firstName || '-',
          lastName: obj.lastName || '-',
          fullName: obj.fullName || '-',
          email: obj.username || '-',
          userName: obj.username1,
          gender: gender,
          status: obj.status,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('WebUsersData');

      worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 25 },
        { header: 'Last Name', key: 'lastName', width: 25 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email-Id', key: 'email', width: 25 },
        { header: 'Username', key: 'userName', width: 25 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registration Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(WebUsersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=One-Order-Users.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in oneOrderUser:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  activeUsers: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        roles: 'U',
        isDeleted: false
      };

      const sortBy = 'createdAt desc';

      if (startDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const users = await Users.find(query).sort(sortBy);
      const WebUsersData = [];

      users.forEach((obj) => {
        let gender = '-';
        if (obj.gender == 'F') {
          gender = 'Female';
        } else if (obj.gender == 'M') {
          gender = 'Male';
        }

        WebUsersData.push({
          firstName: obj.firstName || '-',
          lastName: obj.lastName || '-',
          fullName: obj.fullName || '-',
          email: obj.username || '-',
          userName: obj.username1,
          gender: gender,
          status: obj.status,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('WebUsersData');

      worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 25 },
        { header: 'Last Name', key: 'lastName', width: 25 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email-Id', key: 'email', width: 25 },
        { header: 'Username', key: 'userName', width: 25 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registration Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(WebUsersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=All-Active-Users.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in activeUsers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  appUserExcel: async (req, res) => {
    try {
      const query = {
        domain: { $in: ['ios', 'android'] },
        roles: 'U'
      };

      const sortBy = 'createdAt desc';
      const users = await Users.find(query).sort(sortBy);
      const usersData = [];

      users.forEach((obj) => {
        let gender = '-';
        if (obj.gender == 'F') {
          gender = 'Female';
        } else if (obj.gender == 'M') {
          gender = 'Male';
        }

        usersData.push({
          firstName: obj.firstName || '-',
          lastName: obj.lastName || '-',
          fullName: obj.fullName || '-',
          email: obj.username || '-',
          userName: obj.username1,
          gender: gender,
          domain: obj.domain,
          status: obj.status,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('usersData');

      worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 25 },
        { header: 'Last Name', key: 'lastName', width: 25 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email-Id', key: 'email', width: 25 },
        { header: 'Username', key: 'userName', width: 25 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'App', key: 'domain', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registration Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(usersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=appUsers.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in appUserExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  delieveredOrderExcel: async (req, res) => {
    try {
      const query = {
        order_status: "Delivered"
      };

      const sortBy = 'createdAt desc';
      const reserved = await Reserveorders.find(query)
        .populate('dispensary_id')
        .populate('addedBy')
        .sort(sortBy);

      const usersData = [];

      reserved.forEach((obj) => {
        usersData.push({
          price: obj.price || '-',
          mobile: obj.mobile || '-',
          order_number: obj.order_number || '-',
          invoice_number: obj.invoice_number || '-',
          order_status: obj.order_status,
          delivery_charge: obj.delivery_charge,
          gst: obj.gst,
          store_name: obj.dispensary_id.name,
          order_by: obj.addedBy.username1,
          user_email: obj.addedBy.email,
          updatedAt: obj.updatedAt,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('usersData');

      worksheet.columns = [
        { header: 'Order_number', key: 'order_number', width: 25 },
        { header: 'Invoice_number', key: 'invoice_number', width: 25 },
        { header: 'GST', key: 'gst', width: 10 },
        { header: 'Delivery_charge', key: 'delivery_charge', width: 10 },
        { header: 'Price', key: 'price', width: 10 },
        { header: 'Order_status', key: 'order_status', width: 15 },
        { header: 'Store_name', key: 'store_name', width: 20 },
        { header: 'Order_by', key: 'order_by', width: 20 },
        { header: 'User_email', key: 'user_email', width: 20 },
        { header: 'User contact no.', key: 'mobile', width: 15 },
        { header: 'Order date', key: 'createdAt', width: 15 },
        { header: 'Last updation', key: 'updatedAt', width: 15 },
      ];

      worksheet.addRows(usersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Delivered-Orders.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in delieveredOrderExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  reserveOrderExcel: async (req, res) => {
    try {
      const { order_status } = req.query;
      const query = {};
      const sortBy = 'createdAt desc';

      if (order_status) {
        query.order_status = order_status;
      }

      const reserved = await Reserveorders.find(query)
        .populate('dispensary_id')
        .populate('addedBy')
        .sort(sortBy);

      const usersData = [];

      reserved.forEach((obj) => {
        usersData.push({
          price: obj.price || '-',
          mobile: obj.mobile || '-',
          order_number: obj.order_number || '-',
          invoice_number: obj.invoice_number || '-',
          order_status: obj.order_status,
          delivery_charge: obj.delivery_charge,
          gst: obj.gst,
          store_name: obj.dispensary_id.name,
          order_by: obj.addedBy ? (obj.addedBy.username1 ? obj.addedBy.username1 : "") : "",
          user_email: obj.addedBy ? (obj.addedBy.email ? obj.addedBy.email : "") : "",
          updatedAt: obj.updatedAt,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('usersData');

      worksheet.columns = [
        { header: 'Order_number', key: 'order_number', width: 25 },
        { header: 'Invoice_number', key: 'invoice_number', width: 25 },
        { header: 'GST', key: 'gst', width: 10 },
        { header: 'Delivery_charge', key: 'delivery_charge', width: 10 },
        { header: 'Price', key: 'price', width: 10 },
        { header: 'Order_status', key: 'order_status', width: 15 },
        { header: 'Store_name', key: 'store_name', width: 20 },
        { header: 'Order_by', key: 'order_by', width: 20 },
        { header: 'User_email', key: 'user_email', width: 20 },
        { header: 'User contact no.', key: 'mobile', width: 15 },
        { header: 'Order date', key: 'createdAt', width: 15 },
        { header: 'Last updation', key: 'updatedAt', width: 15 },
      ];

      worksheet.addRows(usersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=reserveOrders.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in reserveOrderExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  grossMarginOrderExcel: async (req, res) => {
    try {
      const query = {
        order_status: "Delivered"
      };

      const sortBy = 'createdAt desc';
      const reserved = await Reserveorders.find(query)
        .populate('dispensary_id')
        .populate('addedBy')
        .sort(sortBy);

      const usersData = [];

      reserved.forEach((obj) => {
        usersData.push({
          grossMargin: obj.gross_margin || '-',
          price: obj.price || '-',
          mobile: obj.mobile || '-',
          order_number: obj.order_number || '-',
          invoice_number: obj.invoice_number || '-',
          order_status: obj.order_status,
          delivery_charge: obj.delivery_charge,
          gst: obj.gst,
          store_name: obj.dispensary_id.name,
          order_by: obj.addedBy.username1,
          user_email: obj.addedBy.email,
          updatedAt: obj.updatedAt,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('usersData');

      worksheet.columns = [
        { header: 'Order_number', key: 'order_number', width: 25 },
        { header: 'Invoice_number', key: 'invoice_number', width: 25 },
        { header: 'GST', key: 'gst', width: 10 },
        { header: 'Delivery_charge', key: 'delivery_charge', width: 10 },
        { header: 'Price', key: 'price', width: 10 },
        { header: 'Gross Margin', key: 'grossMargin', width: 10 },
        { header: 'Order_status', key: 'order_status', width: 15 },
        { header: 'Store_name', key: 'store_name', width: 20 },
        { header: 'Order_by', key: 'order_by', width: 20 },
        { header: 'User_email', key: 'user_email', width: 20 },
        { header: 'User contact no.', key: 'mobile', width: 15 },
        { header: 'Order date', key: 'createdAt', width: 15 },
        { header: 'Last updation', key: 'updatedAt', width: 15 },
      ];

      worksheet.addRows(usersData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=grossMarginReserveOrders.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in grossMarginOrderExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  favExcel: async (req, res) => {
    try {
      const { type } = req.query;
      const query = {};
      const sortBy = 'createdAt desc';

      if (type) {
        query.type = type;
      }

      const fav = await Favourite.find(query)
        .populate('product_id')
        .populate('item_id')
        .populate('addedBy')
        .sort(sortBy);

      const favData = [];

      fav.forEach((obj) => {
        let product_name = '-';
        let store_name = '-';
        if (obj.product_id) {
          product_name = obj.product_id.name;
        }
        if (obj.item_id) {
          store_name = obj.item_id.name;
        }

        favData.push({
          product_name: product_name,
          store_name: store_name,
          fav_by: obj.addedBy.username1,
          user_email: obj.addedBy.email,
          createdAt: obj.createdAt,
        });
      });

      const favProducts = favData.filter((fav) => fav.product_name != '-');
      const favStores = favData.filter((fav) => fav.store_name != '-');

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('favProducts');
      const worksheet1 = workbook.addWorksheet('favStores');

      worksheet.columns = [
        { header: 'Favourite Product', key: 'product_name', width: 25 },
        { header: 'Favourite By', key: 'fav_by', width: 20 },
        { header: 'user_email', key: 'user_email', width: 20 },
        { header: 'Favourite Date', key: 'createdAt', width: 15 },
      ];

      worksheet1.columns = [
        { header: 'Favourite Store', key: 'store_name', width: 25 },
        { header: 'Favourite By', key: 'fav_by', width: 20 },
        { header: 'user_email', key: 'user_email', width: 20 },
        { header: 'Favourite Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(favProducts);
      worksheet1.addRows(favStores);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Favourite.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in favExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  reviewExcel: async (req, res) => {
    try {
      const { order_status } = req.query;
      const query = {};
      const sortBy = 'createdAt desc';

      if (order_status) {
        query.order_status = order_status;
      }

      const reviews = await Reviews.find(query)
        .populate('product_id')
        .populate('item_id')
        .populate('addedBy')
        .sort(sortBy);

      const reviewsData = [];

      reviews.forEach((obj) => {
        let product_name = '-';
        let store_name = '-';
        let review_by = '-';
        let user_email = '-';

        if (obj.product_id) {
          product_name = obj.product_id.name;
        }

        if (obj.item_id) {
          store_name = obj.item_id.name;
        }
        if (obj.addedBy) {
          review_by = obj.addedBy.username1;
          user_email = obj.addedBy.email;
        }

        reviewsData.push({
          product_name: product_name,
          store_name: store_name,
          type: obj.type,
          review_by: review_by,
          user_email: user_email,
          review: obj.detail,
          rating: obj.rating,
          updatedAt: obj.updatedAt,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('reviewsData');

      worksheet.columns = [
        { header: 'Review to', key: 'store_name', width: 25 },
        { header: 'Type', key: 'type', width: 25 },
        { header: 'Review', key: 'review', width: 25 },
        { header: 'Reviewed By', key: 'review_by', width: 25 },
        { header: 'User_email', key: 'user_email', width: 25 },
        { header: 'Rating', key: 'rating', width: 15 },
        { header: 'Review Date', key: 'createdAt', width: 15 },
        { header: 'Last Updation', key: 'updatedAt', width: 15 },
      ];

      worksheet.addRows(reviewsData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Reviews.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in reviewExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  websiteView: async (req, res) => {
    try {
      const query = {
        type: 'websiteView',
        domain: 'Web'
      };

      const sortBy = 'createdAt desc';
      const websiteViews = await Websiteviewed.find(query).sort(sortBy);

      const websiteViewsData = [];

      websiteViews.forEach((obj) => {
        websiteViewsData.push({
          ipAddress: obj.ipAddress,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('websiteViewsData');

      worksheet.columns = [
        { header: 'ipAddress', key: 'ipAddress', width: 20 },
        { header: 'Visiting Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(websiteViewsData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Website-Views.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in websiteView:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  appDownloadExcel: async (req, res) => {
    try {
      const query = {
        type: 'appDownload',
        app_type: { $in: ['ios', 'android'] },
        domain: 'Web'
      };

      const sortBy = 'createdAt desc';
      const websiteViews = await Websiteviewed.find(query).sort(sortBy);

      const websiteViewsData = [];

      websiteViews.forEach((obj) => {
        websiteViewsData.push({
          ipAddress: obj.ipAddress,
          app_type: obj.app_type,
          createdAt: obj.createdAt,
        });
      });

      const iosDownloadData = websiteViewsData.filter(
        (data) => data.app_type === 'ios'
      );
      const androidDownloadData = websiteViewsData.filter(
        (data) => data.app_type === 'android'
      );

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('iosDownloads');
      const worksheet1 = workbook.addWorksheet('androidDownloads');

      worksheet.columns = [
        { header: 'ipAddress', key: 'ipAddress', width: 20 },
        { header: 'Downloading Date', key: 'createdAt', width: 15 },
      ];

      worksheet1.columns = [
        { header: 'ipAddress', key: 'ipAddress', width: 20 },
        { header: 'Downloading Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(iosDownloadData);
      worksheet1.addRows(androidDownloadData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=App-Downloads.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in appDownloadExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  appViewExcel: async (req, res) => {
    try {
      const query = {
        type: 'websiteView',
        domain: { $in: ['ios', 'andriod'] }
      };

      const sortBy = 'createdAt desc';
      const websiteViews = await Websiteviewed.find(query).sort(sortBy);

      const websiteViewsData = [];

      websiteViews.forEach((obj) => {
        websiteViewsData.push({
          ipAddress: obj.ipAddress,
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('websiteViewsData');

      worksheet.columns = [
        { header: 'ipAddress', key: 'ipAddress', width: 20 },
        { header: 'Visiting Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(websiteViewsData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=App-Views.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in appViewExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  salesExcel: async (req, res) => {
    try {
      const { type } = req.query;
      const query = {};
      const sortBy = 'createdAt desc';

      if (type) {
        query.type = type;
      }

      const totaltransactions = await Transcation.find(query)
        .populate('addedBy')
        .sort(sortBy);

      const saleData = [];

      totaltransactions.forEach((obj) => {
        let username = '-';
        let user_email = '-';
        if (obj.addedBy) {
          username = obj.addedBy.username1;
          user_email = obj.addedBy.email;
        }

        saleData.push({
          price: obj.price || '-',
          transaction_id: obj.transaction_id || '-',
          payment_status: obj.payment_status || '-',
          type: obj.type || '-',
          username: username,
          user_email: user_email,
          createdAt: obj.createdAt,
        });
      });

      const normalproduct = saleData.filter(
        (prod) => prod.type === 'ProductOrder'
      );
      const reservedpeoducts = saleData.filter(
        (prod) => prod.type === 'reserved'
      );
      const susData = saleData.filter(
        (prod) => prod.type !== 'reserved' && prod.type === 'ProductOrder'
      );

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('normalproductSale');
      const worksheet1 = workbook.addWorksheet('reservedpeoductsSale');
      const worksheet2 = workbook.addWorksheet('subscriptionsSale');

      worksheet.columns = [
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Transaction_id', key: 'transaction_id', width: 25 },
        { header: 'Payment_status', key: 'payment_status', width: 15 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Username', key: 'username', width: 20 },
        { header: 'User_email', key: 'user_email', width: 20 },
        { header: 'Sale Date', key: 'createdAt', width: 15 },
      ];

      worksheet1.columns = [
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Transaction_id', key: 'transaction_id', width: 25 },
        { header: 'Payment_status', key: 'payment_status', width: 15 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Username', key: 'username', width: 20 },
        { header: 'User_email', key: 'user_email', width: 20 },
        { header: 'Sale Date', key: 'createdAt', width: 15 },
      ];

      worksheet2.columns = [
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Transaction_id', key: 'transaction_id', width: 25 },
        { header: 'Payment_status', key: 'payment_status', width: 15 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Username', key: 'username', width: 20 },
        { header: 'User_email', key: 'user_email', width: 20 },
        { header: 'Sale Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(normalproduct);
      worksheet1.addRows(reservedpeoducts);
      worksheet2.addRows(susData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Sale.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in salesExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  productsExcel: async (req, res) => {
    try {
      const { id } = req.query;
      const query = {
        isDeleted: false,
        dispensary_id: id
      };

      const sortBy = 'createdAt desc';
      const itemProducts = await Itemproduct.find(query).sort(sortBy);

      const productsData = [];

      for (const obj of itemProducts) {
        productsData.push({
          name: obj.name || '-',
          price: obj.price || '-',
          category: obj.instaleaf_categoryName || obj.categoryName,
          producer: obj.supplierName || '-',
          quantity: obj.quantity,
          weight: obj.weight ? obj.weight : null,
          thc: obj.thc || obj.THC_Percent,
          cbd: obj.cbd || obj.CBD_Percent,
          description: obj.description || '-',
        });
      }

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('productsData');

      worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Category', key: 'category', width: 25 },
        { header: 'Producer', key: 'producer', width: 25 },
        { header: 'price', key: 'price', width: 25 },
        { header: 'Quantity', key: 'quantity', width: 25 },
        { header: 'Weight', key: 'weight', width: 10 },
        { header: 'THC', key: 'thc', width: 10 },
        { header: 'CBD', key: 'cbd', width: 15 },
        { header: 'Description', key: 'description', width: 45 },
      ];

      worksheet.addRows(productsData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Products.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in productsExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  normalProductsExcel: async (req, res) => {
    try {
      const query = {
        isDeleted: false,
        status: 'active'
      };

      const sortBy = 'createdAt desc';
      const products = await Product.find(query)
        .populate('category_id')
        .populate('producer')
        .sort(sortBy);

      const productData = [];

      products.forEach((obj) => {
        let categroyName = '-';
        let producer = '-';
        let type = '-';
        
        if (obj.type === '60c33f8385b2685e643d2e22') {
          type = 'CBD';
        } else if (obj.type === '60c33fe385b2685e643d2e24') {
          type = 'Extra';
        } else if (obj.type === '5baf7da74230f81802dff44b') {
          type = 'Hybrid';
        } else if (obj.type === '5bb37e08698a2e2d60b961b5') {
          type = 'Indica Dominant';
        } else if (obj.type === '5cf27c3549c10045457bb77b') {
          type = 'Other category';
        } else if (obj.type === '5bbb7b01c7194a153c1efde2') {
          type = 'Sativa Dominant';
        }
        
        if (obj.category_id && obj.category_id.name) {
          categroyName = obj.category_id.name;
        }

        if (obj.producer && obj.producer.name) {
          producer = obj.producer.name;
        }

        productData.push({
          id: obj.id,
          name: obj.name ? obj.name : '-',
          type: type,
          second_name: obj.second_name,
          category_id: categroyName,
          terpene_profile: obj.terpene_profile,
          city: obj.city,
          thc: obj.thc,
          thcrange: obj.thcrange,
          cbd: obj.cbd,
          cbdrange: obj.cbdrange,
          cbg: obj.cbg,
          cbgrange: obj.cbgrange,
          cbn: obj.cbn,
          cbnrange: obj.cbnrange,
          producer: producer,
          cba: obj.cba,
          cbarange: obj.cbarange,
          thc_type: obj.thc_type,
          cbd_type: obj.cbd_type,
          detail: obj.detail,
          price: obj.price,
          quantity: obj.quantity,
          isFeatured: obj.isFeatured,
          isForDelivery: obj.isForDelivery,
          isSpecial: obj.isSpecial,
          isStaff: obj.isStaff,
          isStore: obj.isStore,
          lineage: obj.lineage,
          cultivator: obj.cultivatorName ? obj.cultivatorName : '-',
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('productData');

      worksheet.columns = [
        { header: 'id', key: 'id', width: 25 },
        { header: 'name', key: 'name', width: 25 },
        { header: 'Type', key: 'type', width: 25 },
        { header: 'Producer', key: 'producer', width: 25 },
        { header: 'Second Name', key: 'second_name', width: 25 },
        { header: 'Category', key: 'category_id', width: 25 },
        { header: 'Terpene Profile', key: 'terpene_profile', width: 25 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'THC', key: 'thc', width: 15 },
        { header: 'THC Range', key: 'thcrange', width: 15 },
        { header: 'THC Type', key: 'thc_type', width: 15 },
        { header: 'CBD', key: 'cbd', width: 15 },
        { header: 'CBD Range', key: 'cbdrange', width: 15 },
        { header: 'CBD Type', key: 'cbd_type', width: 15 },
        { header: 'CBG', key: 'cbg', width: 15 },
        { header: 'CBG Range', key: 'cbgrange', width: 15 },
        { header: 'CBN', key: 'cbn', width: 15 },
        { header: 'CBN Range', key: 'cbnrange', width: 15 },
        { header: 'CBA', key: 'cba', width: 15 },
        { header: 'CBA Range', key: 'cbarange', width: 15 },
        { header: 'Detail', key: 'detail', width: 15 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Lineage', key: 'lineage', width: 15 },
        { header: 'Cultivator', key: 'cultivator', width: 15 },
        { header: 'Creation Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(productData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Products.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in normalProductsExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  productsExcelAdmin: async (req, res) => {
    try {
      const query = {
        isDeleted: false,
        status: 'active'
      };

      const sortBy = 'createdAt desc';
      const products = await Product.find(query)
        .populate('category_id')
        .populate('producer')
        .sort(sortBy);

      const productData = [];

      products.forEach((obj) => {
        let categroyName = '-';
        let producer = '-';
        let type = '-';
        
        if (obj.type === '60c33f8385b2685e643d2e22') {
          type = 'CBD';
        } else if (obj.type === '60c33fe385b2685e643d2e24') {
          type = 'Extra';
        } else if (obj.type === '5baf7da74230f81802dff44b') {
          type = 'Hybrid';
        } else if (obj.type === '5bb37e08698a2e2d60b961b5') {
          type = 'Indica Dominant';
        } else if (obj.type === '5cf27c3549c10045457bb77b') {
          type = 'Other category';
        } else if (obj.type === '5bbb7b01c7194a153c1efde2') {
          type = 'Sativa Dominant';
        }
        
        if (obj.category_id && obj.category_id.name) {
          categroyName = obj.category_id.name;
        }

        if (obj.producer && obj.producer.name) {
          producer = obj.producer.name;
        }

        productData.push({
          id: obj.id,
          name: obj.name ? obj.name : '-',
          type: type,
          second_name: obj.second_name,
          category_id: categroyName,
          terpene_profile: obj.terpene_profile,
          city: obj.city,
          thc: obj.thc,
          thcrange: obj.thcrange,
          cbd: obj.cbd,
          cbdrange: obj.cbdrange,
          cbg: obj.cbg,
          cbgrange: obj.cbgrange,
          cbn: obj.cbn,
          cbnrange: obj.cbnrange,
          producer: producer,
          cba: obj.cba,
          cbarange: obj.cbarange,
          thc_type: obj.thc_type,
          cbd_type: obj.cbd_type,
          detail: obj.detail,
          price: obj.price,
          quantity: obj.quantity,
          isFeatured: obj.isFeatured,
          isForDelivery: obj.isForDelivery,
          isSpecial: obj.isSpecial,
          isStaff: obj.isStaff,
          isStore: obj.isStore,
          lineage: obj.lineage,
          cultivator: obj.cultivatorName ? obj.cultivatorName : '-',
          createdAt: obj.createdAt,
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('productData');

      worksheet.columns = [
        { header: 'id', key: 'id', width: 25 },
        { header: 'name', key: 'name', width: 25 },
        { header: 'Type', key: 'type', width: 25 },
        { header: 'Producer', key: 'producer', width: 25 },
        { header: 'Second Name', key: 'second_name', width: 25 },
        { header: 'Category', key: 'category_id', width: 25 },
        { header: 'Terpene Profile', key: 'terpene_profile', width: 25 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'THC', key: 'thc', width: 15 },
        { header: 'THC Range', key: 'thcrange', width: 15 },
        { header: 'THC Type', key: 'thc_type', width: 15 },
        { header: 'CBD', key: 'cbd', width: 15 },
        { header: 'CBD Range', key: 'cbdrange', width: 15 },
        { header: 'CBD Type', key: 'cbd_type', width: 15 },
        { header: 'CBG', key: 'cbg', width: 15 },
        { header: 'CBG Range', key: 'cbgrange', width: 15 },
        { header: 'CBN', key: 'cbn', width: 15 },
        { header: 'CBN Range', key: 'cbnrange', width: 15 },
        { header: 'CBA', key: 'cba', width: 15 },
        { header: 'CBA Range', key: 'cbarange', width: 15 },
        { header: 'Detail', key: 'detail', width: 15 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Lineage', key: 'lineage', width: 15 },
        { header: 'Cultivator', key: 'cultivator', width: 15 },
        { header: 'Creation Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(productData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Products.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in productsExcelAdmin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updatedProductsExcel: async (req, res) => {
    try {
      const query = {
        isDeleted: false,
        status: 'active'
      };

      const sortBy = 'name asc';
      let { page, count } = req.query;
      
      page = Number(page) || 1;
      count = Number(count) || 50;
      const skipNo = (page - 1) * count;

      const products = await Product.find(query)
        .populate('producer')
        .sort(sortBy)
        .skip(skipNo)
        .limit(count);

      const productData = [];

      for (const obj of products) {
        let categroyName = '-';
        let producer = '-';
        let type = '-';
        let lineage = '';
        let tags = '';
        let terpen = '';

        if (obj.terpene_profile && obj.terpene_profile.length > 0) {
          obj.terpene_profile.forEach((element) => {
            if (element.name && element.value) {
              terpen += element.name + '-' + element.value + ',';
            } else if (element.name && !element.value) {
              terpen += element.name + '-' + 0 + ',';
            }
          });
        }

        if (obj.tags && obj.tags.length > 0) {
          obj.tags.forEach((element) => {
            tags += element + ',';
          });
        }

        if (obj.category_id) {
          categroyName = obj.category_id.name;
        }

        if (obj.producer) {
          producer = obj.producer.name;
        }

        productData.push({
          id: obj.id,
          name: obj.name ? obj.name : '-',
          type: type,
          second_name: obj.second_name,
          category_id: categroyName,
          terpene_profile: terpen,
          city: obj.city,
          thc: obj.thc,
          thcrange: obj.thcrange,
          cbd: obj.cbd,
          cbdrange: obj.cbdrange,
          cbg: obj.cbg,
          cbgrange: obj.cbgrange,
          cbn: obj.cbn,
          cbnrange: obj.cbnrange,
          producer: producer,
          tags: tags,
          sku: obj.sku,
          slug: obj.slug,
          cba: obj.cba,
          cbarange: obj.cbarange,
          thc_type: obj.thc_type,
          cbd_type: obj.cbd_type,
          detail: obj.detail,
          price: obj.price,
          quantity: obj.quantity,
          isFeatured: obj.isFeatured,
          isForDelivery: obj.isForDelivery,
          isSpecial: obj.isSpecial,
          isStaff: obj.isStaff,
          isStore: obj.isStore,
          lineage: lineage,
          cultivator: obj.cultivatorName ? obj.cultivatorName : '-',
          createdAt: obj.createdAt,
        });
      }

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('productData');

      worksheet.columns = [
        { header: 'id', key: 'id', width: 25 },
        { header: 'name', key: 'name', width: 25 },
        { header: 'SKU', key: 'sku', width: 25 },
        { header: 'slug', key: 'slug', width: 25 },
        { header: 'Type', key: 'type', width: 25 },
        { header: 'Producer', key: 'producer', width: 25 },
        { header: 'Second Name', key: 'second_name', width: 25 },
        { header: 'Category', key: 'category_id', width: 25 },
        { header: 'Terpene Profile', key: 'terpene_profile', width: 25 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'THC', key: 'thc', width: 15 },
        { header: 'THC Range', key: 'thcrange', width: 15 },
        { header: 'Tags', key: 'tags', width: 15 },
        { header: 'THC Type', key: 'thc_type', width: 15 },
        { header: 'CBD', key: 'cbd', width: 15 },
        { header: 'CBD Range', key: 'cbdrange', width: 15 },
        { header: 'CBD Type', key: 'cbd_type', width: 15 },
        { header: 'CBG', key: 'cbg', width: 15 },
        { header: 'CBG Range', key: 'cbgrange', width: 15 },
        { header: 'CBN', key: 'cbn', width: 15 },
        { header: 'CBN Range', key: 'cbnrange', width: 15 },
        { header: 'CBA', key: 'cba', width: 15 },
        { header: 'CBA Range', key: 'cbarange', width: 15 },
        { header: 'Detail', key: 'detail', width: 15 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Lineage', key: 'lineage', width: 15 },
        { header: 'Cultivator', key: 'cultivator', width: 15 },
        { header: 'Creation Date', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(productData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=Products.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in updatedProductsExcel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  exportAllItems: async (req, res) => {
    try {
      const { item, page, count, sortBy, name, city } = req.query;
      const itemCount = count ? parseInt(count) : await Item.countDocuments();
      const pageNum = page ? parseInt(page) : 1;
      const limit = count ? parseInt(count) : itemCount;
      const skipNo = (pageNum - 1) * limit;

      let sortquery = {};
      if (sortBy) {
        const typeArr = sortBy.split(' ');
        const sortType = typeArr[1];
        const field = typeArr[0];
        sortquery[field || 'createdAt'] = sortType === 'desc' ? -1 : 1;
      } else {
        sortquery.createdAt = -1;
      }

      const query = { isDeleted: false };

      if (city) {
        const text = city.toLowerCase();
        query.allCity = { $in: [text] };
      }

      if (item) {
        query.$or = [
          { name: { $regex: item, $options: 'i' } },
          { username: { $regex: item, $options: 'i' } },
          { city: { $regex: item, $options: 'i' } },
          { businesstype: { $regex: item, $options: 'i' } },
        ];
      }

      const pipeline = [
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        {
          $unwind: '$addedBy',
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'item_id',
            as: 'reviewData',
          },
        },
        {
          $project: {
            id: '$_id',
            name: '$name',
            username: '$username',
            city: '$city',
            allCity: '$allCity',
            user_visits: '$userVisit',
            reviews: '$totalReviews',
            rating: '$totalRating',
            detail: '$detail',
            addedBy: '$addedBy.username1',
            user_id: '$addedBy._id',
            store_status: '$addedBy.status',
            status: '$status',
            isFeatured: '$isFeatured',
            isDeleted: '$isDeleted',
            isMaster: '$isMaster',
            master_id: '$master_id',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            businesstype: '$businessType',
            medical: '$medical',
            address: '$address',
            postal_code: '$postal_code',
            scheduler: '$scheduler',
            recreational: '$recreational',
            staffRating: '$reviewData.staffRating',
            storeLayoutRating: '$reviewData.storeLayoutRating',
            item_id: '$reviewData.item_id',
            sevenPercentUpPrice: '$sevenPercentUpPrice',
            lat: '$lat',
            lng: '$lng',
            isFeaturedDelivery: '$isFeaturedDelivery',
            storeLicence: '$storeLicence',
            govtRegulationWebsite: '$govtRegulationWebsite',
            meta_name: '$meta_name',
            meta_desc: '$meta_desc',
            fbUrl: '$reviewData.staffRating',
            instagramUrl: '$instagramUrl',
            twitterUrl: '$twitterUrl',
            gabUrl: '$gabUrl',
            thirdParty: '$thirdParty',
            merrcco_client_id: '$merrcco_client_id',
            merrcco_client_secret: '$merrcco_client_secret',
            payment_gateway: '$payment_gateway',
            moneris_storeId: '$moneris_storeId',
            moneris_token: '$moneris_token',
            client_id: '$client_id',
            client_secret: '$client_secret',
            instaleafCommision: '$instaleafCommision',
            commonCourier: '$commonCourier',
            slug: '$slug',
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const totalresults = await Item.aggregate(pipeline);

      const itemData = [];

      totalresults.forEach((obj) => {
        itemData.push({
          name: obj.name || '-',
          username: obj.username || '-',
          city: obj.city || '-',
          allCity: obj.allCity || '-',
          user_visits: obj.user_visits || 0,
          reviews: obj.reviews || 0,
          rating: obj.rating || 0,
          detail: obj.detail || '-',
          addedBy: obj.addedBy || '-',
          store_status: obj.store_status || '-',
          status: obj.status || '-',
          isFeatured: obj.isFeatured || 0,
          isDeleted: obj.isDeleted || '-',
          isMaster: obj.isMaster || 0,
          businesstype: obj.businesstype || '-',
          medical: obj.medical || 0,
          address: obj.address || '-',
          postal_code: obj.postal_code || '-',
          scheduler: obj.scheduler || '-',
          recreational: obj.recreational || '-',
          staffRating: obj.staffRating || '-',
          storeLayoutRating: obj.storeLayoutRating || '-',
          createdAt: obj.createdAt || '-',
          sevenPercentUpPrice: obj.sevenPercentUpPrice || 0,
          lat: obj.lat || '-',
          lng: obj.lng || '-',
          isFeaturedDelivery: obj.isFeaturedDelivery || '-',
          storeLicence: obj.storeLicence || '-',
          govtRegulationWebsite: obj.govtRegulationWebsite || '-',
          meta_name: obj.meta_name || '-',
          meta_desc: obj.meta_desc || '-',
          fbUrl: obj.fbUrl || '-',
          instagramUrl: obj.instagramUrl || '-',
          twitterUrl: obj.twitterUrl || '-',
          gabUrl: obj.gabUrl || '-',
          thirdParty: obj.thirdParty || '-',
          merrcco_client_id: obj.merrcco_client_id || '-',
          merrcco_client_secret: obj.merrcco_client_secret || '-',
          payment_gateway: obj.payment_gateway || '-',
          moneris_storeId: obj.moneris_storeId || '-',
          moneris_token: obj.moneris_token || '-',
          client_id: obj.client_id || '-',
          client_secret: obj.client_secret || '-',
          instaleafCommision: obj.instaleafCommision || 0,
          commonCourier: obj.commonCourier || '-',
          slug: obj.slug || '-',
        });
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('itemData');

      worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Slug', key: 'slug', width: 10 },
        { header: 'Meta Name', key: 'meta_name', width: 10 },
        { header: 'Meta Desc', key: 'meta_desc', width: 10 },
        { header: 'Lat', key: 'lat', width: 10 },
        { header: 'Lng', key: 'lng', width: 10 },
        { header: 'Payment Gateway', key: 'payment_gateway', width: 10 },
        { header: 'Merrcco Client Id', key: 'merrcco_client_id', width: 10 },
        { header: 'Merrcco Client Secret', key: 'merrcco_client_secret', width: 10 },
        { header: 'Moneris StoreId', key: 'moneris_storeId', width: 15 },
        { header: 'Moneris Token', key: 'moneris_token', width: 10 },
        { header: 'Client Id', key: 'client_id', width: 10 },
        { header: 'Client Secret', key: 'client_secret', width: 20 },
        { header: 'Instaleaf Commision', key: 'instaleafCommision', width: 15 },
        { header: 'Common Courier', key: 'commonCourier', width: 10 },
        { header: 'Seven Percent UpPrice', key: 'sevenPercentUpPrice', width: 10 },
        { header: 'IsFeatured Delivery', key: 'isFeaturedDelivery', width: 10 },
        { header: 'Store Licence', key: 'storeLicence', width: 10 },
        { header: 'Businesstype', key: 'businesstype', width: 25 },
        { header: 'Medical', key: 'medical', width: 10 },
        { header: 'IsMaster', key: 'isMaster', width: 10 },
        { header: 'User Visits', key: 'user_visits', width: 10 },
        { header: 'Reviews', key: 'reviews', width: 10 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Store Status', key: 'store_status', width: 15 },
        { header: 'IsFeatured', key: 'isFeatured', width: 10 },
        { header: 'Govt Regulation Website', key: 'govtRegulationWebsite', width: 15 },
        { header: 'Fb Url', key: 'fbUrl', width: 20 },
        { header: 'Instagram Url', key: 'instagramUrl', width: 15 },
        { header: 'Twitter Url', key: 'twitterUrl', width: 10 },
        { header: 'Gab Url', key: 'gabUrl', width: 10 },
        { header: 'ThirdParty', key: 'thirdParty', width: 10 },
        { header: 'Scheduler', key: 'scheduler', width: 10 },
        { header: 'CreatedAt', key: 'createdAt', width: 20 },
        { header: 'AddedBy', key: 'addedBy', width: 15 },
        { header: 'UserName', key: 'username', width: 10 },
        { header: 'Address', key: 'address', width: 10 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'Postal Code', key: 'postal_code', width: 10 },
        { header: 'Status', key: 'status', width: 25 },
      ];

      worksheet.addRows(itemData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=StoreList.xlsx'
      );

      await workbook.xlsx.write(res);
      res.status(200).end();
    } catch (error) {
      console.error('Error in exportAllItems:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};