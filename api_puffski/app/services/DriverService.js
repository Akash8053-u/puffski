const ObjectId = require('mongodb').ObjectId;
// const payment_const = require('../../config/local.js');
// const accountSid = payment_const.TWILIO_INFO.ACCOUNT_SID;
// const authToken = payment_const.TWILIO_INFO.AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
const commonServiceObj = require('./../services/commonService');
// const orderServiceObj = require('../services/orderService.js');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const bcrypt = require('bcrypt-nodejs');
const FirebaseService = require('../services/FirebaseService.js');
const async = require('async');

// const transport = nodemailer.createTransport(
//   smtpTransport({
//     host: sails.config.appSMTP.host,
//     port: sails.config.appSMTP.port,
//     debug: sails.config.appSMTP.debug,
//     auth: {
//       user: sails.config.appSMTP.auth.user,
//       pass: sails.config.appSMTP.auth.pass,
//     },
//   })
// );

class DriverService {
  static generatePassword() {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';

    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  static checkPlusSign(phoneNumber) {
    return phoneNumber.startsWith('+');
  }

  static getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getTimeOfDay() {
    const now = new Date();
    const hours = now.getHours();

    if (hours < 12) {
      return "morning";
    } else if (hours >= 12 && hours < 16) {
      return "afternoon";
    } else if (hours >= 16 && hours < 20) {
      return "evening";
    } else {
      return "night";
    }
  }

  static async userEmail(email, username, password, verifyUrl, firstName, storeName, appLink) {
    const message = this.generateUserEmailTemplate(email, username, password, verifyUrl, firstName, storeName, appLink);
    
    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: 'Puffski Registration <' + sails.config.appSMTP.auth.user + '>',
          to: email,
          subject: 'Activate Puffski Account',
          html: message,
        },
        function (err, info) {
          if (err) {
            console.error('Email error:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              code: 200,
              data: { message: constantObj.messages.ADDED_SUCCESSFULL }
            });
          }
        }
      );
    });
  }

  static generateUserEmailTemplate(email, username, password, verifyUrl, firstName, storeName, appLink) {
    let message = `
      <div class="pos-abs" style="font-family: arial;padding:20px;font-size:16;background:url(http://3.18.4.95:1337/images/bg1.png); background-size:cover; background-position:center;background-repeat: no-repeat;">
        <div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">
          <div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">
            Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory
          </div>
          <div class="logoimg" style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">
            <a href="https://puffski.com"><img src="${sails.config.Puffski_FRONT_WEB_URL}assets/img//logo-img.png" style="width:184px;" /></a>
          </div>
          <div style="text-align:center;padding:0 20px;">
            <h1 style="font-size: 26px;">Welcome ${firstName}</h1><br>
            <p>You've been added as a driver for ${storeName}<br>
            Puffski is a Canadian tech company helping ${storeName} generate and manage their deliveries.</p>
            <p style="margin:0px;">Puffski is here to help you collect delivery orders, delivery fees, and tips. </p>
            <p style="margin:0px;">You'll be notified of new orders through the Puffski courier app which you can download from here.</p><br>
            <div style="text-align:center;padding:0 20px">
              <a href="https://apps.apple.com/in/app/instaleaf-courier/id1621127225"><img style="margin:10px" src="https://endpoint.puffski.com/images/appstore.png"></a>
              <a href="https://play.google.com/store/apps/details?id=com.instaleaf_driver&pli=1"><img style="margin:10px" src="https://endpoint.puffski.com/images/palystore.png"></a>
            </div>
            <p style="margin:0px;">Once you accept the order it's a simple-step-by-step process complete the delivery trip. </p>
            <p style="margin:0px;"> Your credentials are:</p>
            <p style="margin:0px;"> Username: ${username}</p>
            <p style="margin:0px;"> Password: ${password}</p>
          </div>
          <div class="br1" style="padding:15px;text-align: justify; margin:auto 20px;margin-top: 25px;border-top:2px solid;border-bottom:2px solid;border-color: #0c8040;">
            <b>Puffski</b> is an innovative Canadian cannabis tech company built by cannabis enthusiasts.
            Our <b>WEBSITE & APP </b> are here to provide you <b>on-demand delivery </b>
            access to better cannabis experiences. There's a huge variety of cannabis categories and products on the market, our goal is to help you consistently connect with <b>better cannabis products</b> for your needs.
          </div>
          <div style="text-align:center;padding:0 20px">
            <a href="https://apps.apple.com/in/app/instaleaf-courier/id1621127225"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/app-store.png"></a>
            <a href="https://play.google.com/store/apps/details?id=com.instaleaf_driver&pli=1"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/googleplay.jpg"></a>
            <a href="https://puffski.com/"><img src="${sails.config.Puffski_FRONT_WEB_URL}assets/img//logo-img.png" style="display: block; margin: auto;width: 150px;"></a>
            <p><b>Don't Forget To Stay Connected on Social</b></p>
          </div>
          <div class="social-icon" style="text-align:center;">
            <a href="https://www.facebook.com/puffski.com/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/facebook.png" style="width: 45px;margin:10px"></a>
            <a href="https://twitter.com/PuffskiOfficial"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/twitter.png" style="width: 45px;margin:10px"></a>
            <a href="https://www.youtube.com/channel/UCI4PQWxuttUwlEyZWXIO1hg"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/youtube.png" style="width: 45px;margin:10px"></a>
            <a href="https://www.instagram.com/Puffski.official/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/instagram.png" style="width: 45px;margin:10px"></a>
          </div>
          <div class="bg-black" style="background-color:#2e2f2f;padding:15px;color:#fff;text-align:center">
            <p style="margin-top:0;">
              <a href="https://puffski.com/page/contact-us" style="color:#fff;">Support</a>
              <a href="https://puffski.com/auth/terms" style="color:#fff;">Terms of use</a>
              <a href="https://puffski.com/auth/privacy-policy" style="color:#fff;">Privacy Policy</a>
            </p>
            If you need help, or have any questions, send us an email: <a href="mailto:admin@puffski.com" style="color:#fff">admin@puffski.com</a>
          </div>
        </div>
      </div>
    `;
    return message;
  }

  static async orderEmail(email, order_number, username, storeName) {
    const message = this.generateOrderEmailTemplate(email, order_number, username, storeName);
    
    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: 'Puffski Order <' + sails.config.appSMTP.auth.user + '>',
          to: email,
          subject: 'Puffski Order',
          html: message,
        },
        function (err, info) {
          if (err) {
            console.error('Email error:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              code: 200,
              data: { message: constantObj.messages.ADDED_SUCCESSFULL }
            });
          }
        }
      );
    });
  }

  static generateOrderEmailTemplate(email, order_number, username, storeName) {
    let message = `
      <div class="pos-abs" style="font-family: arial;padding:20px;font-size:16;background:url(http://3.18.4.95:1337/images/bg1.png); background-size:cover; background-position:center;background-repeat: no-repeat;">
        <div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">
          <div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">
            On Demand <span style="color:rgb(255,96,84)">Delivery</span> Driver
          </div>
          <div class="logoimg" style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">
            <a href="https://puffski.com"><img src="${sails.config.Puffski_FRONT_WEB_URL}assets/img//logo-img.png" style="width:184px;" /></a>
          </div>
          <div style="text-align:center;padding:0 20px;">
            <h1 style="font-size: 26px;">Hello ${username}</h1>
            <p style="font-size: 16px;">You have new order on puffski.com<br>
              Pickup Location : ${storeName} <br>
              Your order number is ${order_number}<br>
            </p>
          </div>
          <div class="br1" style="padding:15px;text-align: center; margin:auto 20px;margin-top: 25px;border-top:2px solid;border-bottom:2px solid;border-color: #0c8040;font-size: 16px;">
            Open the <b>Instaleaf Courier app</b> to accept, manage, and complete your<br>
            delivery trip. You may need to refresh the homepage on the app to<br>
            <b>accept the order. View order details</b> and <b>find the customer address</b><br>
            and contact details. As a final step match the customer to their ID <b>Have</b><br>
            <span style="text-align:center;"><b>a safe trip</b></span>
          </div>
          <div style="text-align:center;padding:0 20px">
            <a href="https://apps.apple.com/us/app/instaleaf-courier/id1621127225"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/app-store.png"></a>
            <a href="https://play.google.com/store/apps/details?id=com.instaleaf_driver"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/googleplay.jpg"></a>
          </div>
          <div class="bg-black" style="background-color:#2e2f2f;padding:15px;color:#fff;text-align:center">
            <p style="margin-top:0;">
              <a href="https://puffski.com/page/contact-us" style="color:#fff;">Support</a>
              <a href="https://puffski.com/auth/terms" style="color:#fff;">   Terms of use</a>
              <a href="https://puffski.com/auth/privacy-policy" style="color:#fff;">   Privacy Policy</a>
            </p>
            If you need help, or have any questions, send us an email: <a href="mailto:admin@puffski.com" style="color:#fff">admin@puffski.com</a>
          </div>
        </div>
      </div>
    `;
    return message;
  }

  static async expressOrderEmail(email, order_number, username, storeName) {
    const message = this.generateExpressOrderEmailTemplate(email, order_number, username, storeName);
    
    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: 'Puffski Order <' + sails.config.appSMTP.auth.user + '>',
          to: email,
          subject: 'Puffski Express Delivery Order',
          html: message,
        },
        function (err, info) {
          if (err) {
            console.error('Email error:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              code: 200,
              data: { message: constantObj.messages.ADDED_SUCCESSFULL }
            });
          }
        }
      );
    });
  }

  static generateExpressOrderEmailTemplate(email, order_number, username, storeName) {
    let message = `
      <div class="pos-abs" style="font-family: arial;padding:20px;font-size:16;background:url(http://3.18.4.95:1337/images/bg1.png); background-size:cover; background-position:center;background-repeat: no-repeat;">
        <div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">
          <div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">
            On Demand <span style="color:rgb(255,96,84)">Delivery</span> Driver
          </div>
          <div class="logoimg" style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">
            <a href="https://puffski.com"><img src="${sails.config.Puffski_FRONT_WEB_URL}assets/img//logo-img.png" style="width:184px;" /></a>
          </div>
          <div style="text-align:center;padding:0 20px;">
            <h1 style="font-size: 26px;">Hello ${username}</h1>
            <p style="font-size: 16px;">You have new express courier order on puffski.com<br>
              Pickup Location : ${storeName} <br>
              Your express delivery number is ${order_number}<br>
            </p>
          </div>
          <div class="br1" style="padding:15px;text-align: center; margin:auto 20px;margin-top: 25px;border-top:2px solid;border-bottom:2px solid;border-color: #0c8040;font-size: 16px;">
            Open the <b>Instaleaf Courier app</b> to accept, manage, and complete your<br>
            delivery trip. You may need to refresh the homepage on the app to<br>
            <b>accept the order. View order details</b> and <b>find the customer address</b><br>
            and contact details. As a final step match the customer to their ID <b>Have</b><br>
            <span style="text-align:center;"><b>a safe trip</b></span>
          </div>
          <div style="text-align:center;padding:0 20px">
            <a href="https://apps.apple.com/us/app/instaleaf-courier/id1621127225"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/app-store.png"></a>
            <a href="https://play.google.com/store/apps/details?id=com.instaleaf_driver"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/googleplay.jpg"></a>
          </div>
          <div class="bg-black" style="background-color:#2e2f2f;padding:15px;color:#fff;text-align:center">
            <p style="margin-top:0;">
              <a href="https://puffski.com/page/contact-us" style="color:#fff;">Support</a>
              <a href="https://puffski.com/auth/terms" style="color:#fff;">   Terms of use</a>
              <a href="https://puffski.com/auth/privacy-policy" style="color:#fff;">   Privacy Policy</a>
            </p>
            If you need help, or have any questions, send us an email: <a href="mailto:admin@puffski.com" style="color:#fff">admin@puffski.com</a>
          </div>
        </div>
      </div>
    `;
    return message;
  }

  static async forgotEmail(email, username, password) {
    const message = this.generateForgotEmailTemplate(email, username, password);
    
    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: 'Puffski <' + sails.config.appSMTP.auth.user + '>',
          to: email,
          subject: 'Password Changed',
          html: message,
        },
        function (err, info) {
          if (err) {
            console.error('Email error:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              code: 200,
              data: { message: constantObj.messages.ADDED_SUCCESSFULL }
            });
          }
        }
      );
    });
  }

  static generateForgotEmailTemplate(email, username, password) {
    let message = `
      <div class="pos-abs" style="font-family: arial;padding:20px;font-size:16;background:url(http://3.18.4.95:1337/images/bg1.png); background-size:cover; background-position:center;background-repeat: no-repeat;">
        <div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">
          <div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">
            Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory
          </div>
          <div class="logoimg" style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">
            <a href="https://puffski.com"><img src="${sails.config.Puffski_FRONT_WEB_URL}assets/img//logo-img.png" style="width:184px;" /></a>
          </div>
          <div style="text-align:center;padding:0 20px;">
            <h1 style="font-size: 26px;">Hello ${username}</h1>
            <p style="font-size: 16px;">Your password has been changed. <br>
              Your new password is ${password}<br>
            </p>
            <p style="font-size: 16px;">Couple things puffski can help you with:</p>
            <ul style="text-align:justify;font-size: 16px;">
              <li>Join a community of likeminded Cannabis enthusiasts</li>
              <li>Easily find open Cannabis stores across Canada.</li>
              <li>Access to location menus from the app, and providing you visibility to what's in stock.</li>
              <li>From community reviews and our strain database, Identify and learn strains that are right for you.</li>
              <li>Track and review your favourite strains in your personalized app diary while earn rewards and swag for doing so!</li>
            </ul>
          </div>
          <div class="br1" style="padding:15px;text-align: justify; margin:auto 20px;margin-top: 25px;border-top:2px solid;border-bottom:2px solid;border-color: #0c8040;font-size: 16px;">
            <b>Puffski</b> is an innovative Canadian Cannabis Tech Company built by Cannabis enthusiasts to enhance your user experience. Our <b>FREE</b> App provides <b>YOU</b> access to Canadian Cannabis retailers, clinics, and businesses. Our goal is to continuously improve <b>YOUR</b> experience with our technology, helping you explore, learn, communicate, connect, share, find, record, all while keeping you "up to speed" with the Canadian Cannabis space.
          </div>
          <div style="text-align:center;padding:0 20px">
            <a href="https://apps.apple.com/ca/app/puffski/id1470681772"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/app-store.png"></a>
            <a href="https://play.google.com/store/apps/details?id=com.puffski&hl=en"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/googleplay.jpg"></a>
            <a href="https://puffski.com/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/puffski.png" style="display: block; margin: auto;width: 150px;"></a>
            <p><b>Don't Forget To Stay Connected on Social</b></p>
          </div>
          <div class="social-icon" style="text-align:center;">
            <a href="https://www.facebook.com/puffski.com/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/facebook.png" style="width: 45px;margin:10px"></a>
            <a href="https://twitter.com/PuffskiOfficial"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/twitter.png" style="width: 45px;margin:10px"></a>
            <a href="https://www.youtube.com/channel/UCI4PQWxuttUwlEyZWXIO1hg"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/youtube.png" style="width: 45px;margin:10px"></a>
            <a href="https://www.instagram.com/puffski.official/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/instagram.png" style="width: 45px;margin:10px"></a>
          </div>
          <div class="bg-black" style="background-color:#2e2f2f;padding:15px;color:#fff;text-align:center">
            <p style="margin-top:0;">
              <a href="https://puffski.com/page/contact-us" style="color:#fff;">Support</a>
              <a href="https://puffski.com/auth/terms" style="color:#fff;">  Terms of use</a>
              <a href="https://puffski.com/auth/privacy-policy" style="color:#fff;">  Privacy Policy</a>
            </p>
            If you need help, or have any questions, send us an email: <a href="mailto:admin@puffski.com" style="color:#fff">admin@puffski.com</a>
          </div>
        </div>
      </div>
    `;
    return message;
  }

  static async acceptRejectEmailStore(order_number, status, email, username, driver) {
    const message = this.generateAcceptRejectEmailTemplate(order_number, status, email, username, driver);
    
    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: 'Puffski Order <' + sails.config.appSMTP.auth.user + '>',
          to: email,
          subject: 'Puffski Order',
          html: message,
        },
        function (err, info) {
          if (err) {
            console.error('Email error:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              code: 200
            });
          }
        }
      );
    });
  }

  static generateAcceptRejectEmailTemplate(order_number, status, email, username, driver) {
    let message = `
      <div class="pos-abs" style="font-family: arial;padding:20px;font-size:16;background:url(http://3.18.4.95:1337/images/bg1.png); background-size:cover; background-position:center;background-repeat: no-repeat;">
        <div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">
          <div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">
            Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory
          </div>
          <div class="logoimg" style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">
            <a href="https://puffski.com"><img src="${sails.config.Puffski_FRONT_WEB_URL}assets/img//logo-img.png" style="width:184px;" /></a>
          </div>
          <div style="text-align:center;padding:0 20px;">
            <h1 style="font-size: 26px;">Hello ${username}</h1>
            <p style="font-size: 16px;"><br>
              Your assigned order having order number <b>${order_number}</b> is <b>${status}</b> by driver ${driver}<br>
            </p>
          </div>
          <div class="br1" style="padding:15px;text-align: justify; margin:auto 20px;margin-top: 25px;border-top:2px solid;border-bottom:2px solid;border-color: #0c8040;font-size: 16px;">
            <b>Puffski</b> is an innovative Canadian Cannabis Tech Company built by Cannabis enthusiasts to enhance your user experience. Our <b>FREE</b> App provides <b>YOU</b> access to Canadian Cannabis retailers, clinics, and businesses. Our goal is to continuously improve <b>YOUR</b> experience with our technology, helping you explore, learn, communicate, connect, share, find, record, all while keeping you "up to speed" with the Canadian Cannabis space.
          </div>
          <div style="text-align:center;padding:0 20px">
            <a href="https://apps.apple.com/ca/app/puffski/id1470681772"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/app-store.png"></a>
            <a href="https://play.google.com/store/apps/details?id=com.puffski&hl=en"><img style="width:100px;margin:10px" src="https://endpoint.puffski.com/images/googleplay.jpg"></a>
            <a href="https://puffski.com/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/puffski.png" style="display: block; margin: auto;width: 150px;"></a>
            <p><b>Don't Forget To Stay Connected on Social</b></p>
          </div>
          <div class="social-icon" style="text-align:center;">
            <a href="https://www.facebook.com/puffski.com/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/facebook.png" style="width: 45px;margin:10px"></a>
            <a href="https://twitter.com/PuffskiOfficial"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/twitter.png" style="width: 45px;margin:10px"></a>
            <a href="https://www.youtube.com/channel/UCI4PQWxuttUwlEyZWXIO1hg"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/youtube.png" style="width: 45px;margin:10px"></a>
            <a href="https://www.instagram.com/puffski.official/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/instagram.png" style="width: 45px;margin:10px"></a>
          </div>
          <div class="bg-black" style="background-color:#2e2f2f;padding:15px;color:#fff;text-align:center">
            <p style="margin-top:0;">
              <a href="https://puffski.com/page/contact-us" style="color:#fff;">Support</a>
              <a href="https://puffski.com/auth/terms" style="color:#fff;">  Terms of use</a>
              <a href="https://puffski.com/auth/privacy-policy" style="color:#fff;">  Privacy Policy</a>
            </p>
            If you need help, or have any questions, send us an email: <a href="mailto:admin@puffski.com" style="color:#fff">admin@puffski.com</a>
          </div>
        </div>
      </div>
    `;
    return message;
  }

  static async emailToCustomer(options) {
    const message = this.generateCustomerEmailTemplate(options);
    
    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: 'Puffski <' + sails.config.appSMTP.auth.user + '>',
          to: options.email,
          subject: 'Puffski Order Decline',
          html: message,
        },
        function (err, info) {
          if (err) {
            console.error('Email error:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              code: 200
            });
          }
        }
      );
    });
  }

  static generateCustomerEmailTemplate(options) {
    let message = `
      <div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">
        <div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">
          Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory
        </div>
        <div class="logoimg" style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">
          <a href="https://puffski.com"><img src="${sails.config.puffski_FRONT_WEB_URL}assets/img//logo-img.png" style="width:184px;" /></a>
        </div>
        <div style="text-align:center;padding:0 20px;">
          <h1 style="font-size: 26px;">Hello ${options.email}</h1>
          <p style="font-size: 16px;">Your order number ${options.order_number} has been declined.</p>
          <p style="font-size: 16px;">Reason: ${options.reason}</p>
        </div>
      </div>
    `;
    return message;
  }

  static async paymentReserveEmail(orders, email, username, storeName, address, payment_status) {
    const message = this.generatePaymentReserveEmailTemplate(orders, email, username, storeName, address, payment_status);
    
    return new Promise((resolve, reject) => {
      transport.sendMail(
        {
          from: 'Puffski Shopping <' + sails.config.appSMTP.auth.user + '>',
          to: email,
          subject: 'Thank you For Shopping From Puffski',
          html: message,
        },
        function (err, info) {
          if (err) {
            console.error('Email error:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              code: 200
            });
          }
        }
      );
    });
  }

  static generatePaymentReserveEmailTemplate(orders, email, username, storeName, address, payment_status) {
    let grandTotal = 0;
    let delivery_charge = 0;
    let subSum = 0;
    const capsusername = username.charAt(0).toUpperCase() + username.slice(1);
    
    let message = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
          <title></title>
          <link rel="icon" type="image/x-icon" href="https://puffski.com/favicon.ico">
      </head>
      <body style="margin: 0px; padding:0;">
          <table width="100%" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans',sans-serif; font-family: 'Open Sans', sans-serif;">
              <tr>
                  <td>
                      <table style="width: 800px; margin: 0px auto;">
                          <tr>
                              <td>
                                  <table width="100%">
                                  <tr>
                                      <td style="height:20px;">&nbsp;</td>
                                  </tr>
                                  <tr>
                                  <tr>
                                      <td style="padding: 0 20px;">
                                          <p style="font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px; text-align: center;">
                                          <a target="_blank" href="https://puffski.coms/"><img style="max-width: 90px;" src="https://www.puffski.com/assets/img//logo-img.png" data-holder-rendered="true"></a>
                                          </p>
                                          <p style="font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px; height: 50px; background-color: #285947;"></p>
                                          <div style="max-width: 600px; margin: 0px auto;">
                                          <h1 style="color:#2c363a; margin:30px 0px 12px 0px; line-height:24px; text-align: center;">
                                            Order Placed
                                          </h1>
                                          <p style="font-size:15px; color:#2c363a; margin:0px 0 0px 0px; line-height:14px; text-align: center;">
                                          <strong>Your order has been placed with ${storeName} for delivery ASAP. </strong> </p>
                                          <p style="font-size:17px; color:#2c363a; margin:0px 0 30px 0px; line-height:18px; text-align: center;">
                                           <br> <strong>Big thanks for choosing Puffski and supporting your<br> local independent cannabis stores! </strong>
                                          </p>
                                      </div>
                                          <p style="font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px; border-bottom: 1px solid #dedede;"></p>
                                          <div style="max-width: 600px; margin: 0px auto;">
                                          <p style="font-size:18px; color:#2c363a; margin:35px 0 30px 0px; line-height:24px; text-align: center; text-transform: uppercase;">
                                              <strong>order ${orders.order_number}</strong>
                                          </p>
                                          <p style="font-size:15px; color:#2c363a; margin:0px 0 0px; line-height:24px;">
                                        ${address}
                                          </p>
                                          <p style="font-size:15px; color:#2c363a; margin:0px 0 30px; line-height:24px;">
                                              Place for Delivery ASAP. Payment status: ${payment_status}
                                                </p>`;
    
    if (orders.order_detail && orders.order_detail.length > 0) {
      orders.order_detail.forEach((element) => {
        message += `<p style="width: 54%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                           ${element.item_product_id ? element.item_product_id.name : ""}
                              </p>`;
        message += `<p style="width: 20%; float: left; font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                          x${element.quantity}
                                  </p>`;
        const mainprice = element.price;
        message += `<p style="width: 20%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                  $${element.updatedprice ? ((parseFloat(element.quantity) * parseFloat(element.updatedprice))) : ((parseFloat(element.quantity) * parseFloat(mainprice)))}
          </p>`;
        
        grandTotal = (parseFloat(element.quantity) * parseFloat(element.updatedprice ? element.updatedprice : element.price)) / 100;
      });
    }

    if (orders.order_detail && orders.order_detail.length > 1) {
      subSum += parseFloat(grandTotal);
    } else {
      subSum = parseFloat(grandTotal);
    }

    if (orders.delivery_charge) {
      delivery_charge = Number(orders.delivery_charge);
      message += `<p style="width: 74%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                                        Delivery Fee
                                            </p>
                  <p style="width: 26%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                                                   ${!orders.promoId ? "" : "- "} ${!orders.promoId ? delivery_charge : delivery_charge}
                                                </p>`;
    }

    if (orders.promoId) {
      message += `<p style="width: 74%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                                        Promocode Discount
                                            </p>
                  <p style="width: 26%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                                                   ${orders.delivery_charge}
                                                </p>`;
    }

    message += `
                <p style="width: 74%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                Service Fee
                      </p>
                  <p style="width: 26%;float: left;text-align:end; font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                  $${orders.serviceFee ? orders.serviceFee.toFixed(2) : 0}
                      </p>
                  <p style="width: 74%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                  GST
                       </p>
                   <p style="width: 26%;float: left;text-align:end;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                    $${orders.gst_price ? orders.gst_price.toFixed(2) : '0.00'}
                       </p>
                  <p style="width: 74%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                  Tip the Courier
                       </p>
                   <p style="width: 26%;float: left;text-align:end;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                    $${orders.tip ? orders.tip : 0}
                       </p>
                  <p style="width: 74%;float: left;font-weight:600;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                  GRAND TOTAL
                       </p>
                   <p style="width: 26%;float: left;text-align:end;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px;">
                    $${orders.price ? orders.price.toFixed(2) : '0.00'}
                       </p>
                       <p style="width: 80%; float: left; font-size:15px; color:#2c363a; margin:20px 0 12px; line-height:24px;">
                        Paid with Credit Card
                             </p>
                             <p style="width: 100%; float: left; font-size:15px; color:#2c363a; margin:30px 0 30px; line-height:24px; text-align: center;">
                             <a href="https://play.google.com/store/apps/details?id=com.instaleaf"><img style="max-width: 90px;" src="https://endpoint.puffski.com/images/googleplay.jpg"></a>
                              <a href="https://apps.apple.com/us/app/puffski/id1470681772"><img style="max-width: 90px;" src="https://endpoint.puffski.com/images/app-store.png"></a>
                            </p>
                            <p style="width: 100%;float: left;font-size:15px; color:#2c363a; margin:0px 0 12px; line-height:24px; text-align: center;">
                            <a href="https://www.instagram.com/puffski.official/"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/instagram.png" style="width: 45px;margin:10px"></a>
                            <a href="https://twitter.com/PuffskiOfficial"><img src="${sails.config.Puffski_BACK_WEB_URL}/images/twitter.png" style="width: 45px;margin:10px"></a>
                                 </p>
                      </div>
                                  </td>
                              </tr>
                              <tr>
                                  <td style="height:20px;">&nbsp;</td>
                              </tr>
                          </table>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
      </body>
      </html>
    `;
    
    return message;
  }

  static async addDriver(data) {
    if (!data.username1) {
      data.username1 = data.username.replace(/\s/g, '');
    }

    data.username = data.email.replace(/\s/g, '');
    data.email = data.email.replace(/\s/g, '');
    data.Type = 'DRIVER';
    data.fullfilled_orders = 0;
    data.status = 'active';
    const date = new Date();

    if (!data.email || data.email === undefined) {
      throw new Error(constantObj.driver.EMAIL_REQUIRED);
    }

    if (!data.username || data.username === undefined) {
      throw new Error(constantObj.driver.USERNAME_REQUIRED);
    }

    const emailCheck = await Users.findOne({
      email: data.email,
      isDeleted: false,
    });

    if (emailCheck) {
      await StoreDrivers.create({
        driver_id: emailCheck.id,
        addedBy: data.addedBy,
      });

      const store = await Item.findOne({
        isDeleted: false,
        addedBy: data.addedBy,
      });

      const password = emailCheck.username1;
      const encryptedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

      await Users.update({ id: emailCheck.id }, {
        roles: "DRIVER",
        Type: 'DRIVER',
        encryptedPassword: encryptedPassword
      });

      await this.userEmail(
        emailCheck.email,
        emailCheck.username1,
        password,
        sails.config.Puffski_BACK_WEB_URL + '/verify/' + data.email,
        emailCheck.firstName,
        store.username ? store.username : 'Puffski',
        `https://play.google.com/store/apps/details?id=com.instaleaf_driver&pli=1`
      );

      return { message: constantObj.driver.ADDED };
    } else {
      data.date_registered = date;
      data.date_verified = date;
      data.roles = 'DRIVER';
      data.isVerified = 'Y';
      const password = data.username1;
      data.password = password;
      const code = commonServiceObj.getUniqueCode();
      data.code = code;

      if (data.cityDriver) {
        const arr = data.cityDriver;
        data.cityDriverString = arr.map(item => item.toLowerCase()).join(", ");
      }

      const createdDriver = await Users.create(data);
      const store = await Item.findOne({
        isDeleted: false,
        addedBy: data.addedBy,
      });

      await this.userEmail(
        data.email,
        data.username1,
        password,
        sails.config.Puffski_BACK_WEB_URL + '/verify/' + data.email,
        data.firstName,
        store.username ? store.username : 'Puffski',
        `https://play.google.com/store/apps/details?id=com.instaleaf_driver&pli=1`
      );

      await StoreDrivers.create({
        driver_id: createdDriver.id,
        addedBy: data.addedBy,
      });

      return { message: constantObj.driver.ADDED };
    }
  }

  static async getStoreDriver(queryParams) {
    const {
      search,
      sortBy = 'createdAt DESC',
      page = 1,
      count = 10,
      status,
      addedBy,
      city,
      commonCourier
    } = queryParams;

    const skipNo = (page - 1) * count;
    let query = {};
    query.isDeleted = false;
    query.roles = 'DRIVER';

    if (addedBy) {
      let driver_Ids = [];
      const addedDrivers = await StoreDrivers.find({ addedBy: addedBy });

      query.addedBy = addedBy;
      const addedUsers = await Users.find(query);

      if (addedUsers && addedUsers.length > 0) {
        addedUsers.forEach(itm => {
          driver_Ids.push(itm.id);
        });
      }

      if (addedDrivers && addedDrivers.length > 0) {
        addedDrivers.forEach(itm => {
          driver_Ids.push(itm.driver_id);
        });
      }

      query.id = { $in: driver_Ids };
      delete query.addedBy;
    }

    if (search) {
      query.$or = [
        { fullName: { like: '%' + search + '%' } },
        { email: { like: '%' + search + '%' } },
        { username1: { like: '%' + search + '%' } },
        { cityDriverString: { like: '%' + search + '%' } },
      ];
    }

    if (commonCourier && (commonCourier == 'true' || commonCourier == true)) {
      query.commonCourier = true;
    }

    if (city) {
      query.cityDriver = {
        $elemMatch: { $regex: new RegExp(`^${city}$`, 'i') }
      };
    }

    if (status) {
      if (status == "deactive") {
        query.status = "deactive";
      } else {
        query.status = "active";
      }
    }

    const total = await Users.count(query);

    let users = await Users.find(query)
      .sort(sortBy)
      .skip(skipNo)
      .limit(count)
      .populate('addedBy');

    const orderStats = await Reserveorders.native((err, orderlist) => {
      return orderlist.aggregate([
        { $group: { _id: '$driver', count: { $sum: 1 } } }
      ]).toArray();
    });

    const currentDateString = this.getCurrentDateString();

    users = await Promise.all(
      users.map(async (user) => {
        const order = orderStats.find(order => order._id && order._id.toString() === user.id.toString());

        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);

        const driverQuery = {
          driverId: user.id,
          startDate: { $gte: start }
        };

        const driverBooking = await DriverScheduler.find(driverQuery);
        user.driverBooking = driverBooking || [];

        if (driverBooking && driverBooking.length > 0) {
          const scData = driverBooking[0];
          const timeOfDay = this.getTimeOfDay();

          if ((timeOfDay == "morning" && scData.morning == true) ||
            (timeOfDay == "afternoon" && scData.afternoon == true) ||
            (timeOfDay == "evening" && scData.evening == true)) {
            user.schedulingStatus = "Online";
            user.schedulingOrder = 1;
          } else {
            const scheduleCheck = await DriverStatus.findOne({
              addedBy: user.id,
              scheduleDate: currentDateString,
            });

            if (scheduleCheck) {
              user.schedulingStatus = scheduleCheck.scheduleStatus;
              user.schedulingOrder = scheduleCheck.scheduleStatus == "Standby" ? 2 : 3;
            } else {
              user.schedulingStatus = "Offline";
              user.schedulingOrder = 3;
            }
          }
        } else {
          const scheduleCheck = await DriverStatus.findOne({
            addedBy: user.id,
            scheduleDate: currentDateString,
          });

          if (scheduleCheck) {
            user.schedulingStatus = scheduleCheck.scheduleStatus;
            user.schedulingOrder = scheduleCheck.scheduleStatus == "Standby" ? 2 : 3;
          } else {
            user.schedulingStatus = "Offline";
            user.schedulingOrder = 3;
          }
        }

        user.totalOrder = order ? order.count : 0;
        return user;
      })
    );

    users.sort((a, b) => a.schedulingOrder - b.schedulingOrder);

    return {
      data: users,
      total: total,
    };
  }

  static async assignOrder(data) {
    const order = await Reserveorders.findOne({ id: data.id })
      .populate('addedBy')
      .populate('dispensary_id');

    const driver = await Users.findOne({ id: data.driver });

    await Reserveorders.update({ id: data.id }, { driver: data.driver });

    if (order.type == "ExpressPickup") {
      await this.expressOrderEmail(
        driver.email,
        order.express_Id ? order.express_Id : '123456',
        driver.firstName ? driver.firstName : driver.username,
        order.pickupAddress
      );
    } else {
      await this.orderEmail(
        driver.email,
        order.order_number ? order.order_number : '123456',
        driver.firstName ? driver.firstName : driver.username,
        order.dispensary_id.name
      );
    }

    if (!order.driver) {
      if (order.type != "ExpressPickup") {
        await this.paymentReserveEmail(
          order,
          order.addedBy.email,
          order.addedBy.username1,
          order.dispensary_id.name,
          order.dispensary_id.address,
          order.payment_status
        );
      }

      const notification = {
        notification: 'Your express courier order has been accepted.',
        status: 'accepted',
        readStatus: false
      };

      await Notifications.update({ orderId: order.id }, notification);
    }

    if (driver.push_token) {
      await FirebaseService.sendFireBaseNotification({
        push_token_array: driver.push_token_array,
        token: driver.push_token,
        notification: 'You have a new express courier order.',
        domain: driver.domain,
        id: data.id,
      });
    }

    return { message: constantObj.driver.DRIVER_ASSIGN };
  }

  static async assignMultipleOrder(data) {
    const order = await Reserveorders.findOne({ id: data.id })
      .populate('addedBy')
      .populate('dispensary_id');

    if (!order.driver) {
      if (order.type != "ExpressPickup") {
        await this.paymentReserveEmail(
          order,
          order.addedBy.email,
          order.addedBy.username1,
          order.dispensary_id ? order.dispensary_id.name : "",
          order.dispensary_id ? order.dispensary_id.address : "",
          order.payment_status
        );
      }

      const notification = {
        notification: 'Your express courier order has been accepted.',
        status: 'accepted',
        readStatus: false
      };

      await Notifications.update({ orderId: order.id }, notification);
    }

    if (data.currentDriver) {
      await Reserveorders.update(
        { id: data.id },
        { multipleAssignedDriver: data.multipleDriver }
      );

      for (const itm of data.currentDriver) {
        const driver = await Users.findOne({ id: itm });

        if (order.type == "ExpressPickup") {
          await this.expressOrderEmail(
            driver.email,
            order.express_Id ? order.express_Id : '123456',
            driver.firstName ? driver.firstName : driver.username,
            order.pickupAddress
          );
        } else {
          await this.orderEmail(
            driver.email,
            order.order_number ? order.order_number : '123456',
            driver.firstName ? driver.firstName : driver.username,
            order.dispensary_id ? order.dispensary_id.name : ""
          );
        }

        if (driver.push_token) {
          await FirebaseService.sendFireBaseNotification({
            push_token_array: driver.push_token_array,
            token: driver.push_token,
            notification: 'You have a new express courier order.',
            domain: driver.domain,
            id: data.id,
          });
        }

        let phoneNumber = "";
        if (this.checkPlusSign(driver.mobile)) {
          phoneNumber = driver.mobile;
        } else {
          phoneNumber = "+1" + driver.mobile;
        }

        await client.messages.create({
          body: 'Hello!\nThere is a puffski delivery available, check the courier app to accept.',
          to: phoneNumber,
          from: '+19787407098',
        });
      }
    }

    return { message: constantObj.driver.DRIVER_ASSIGN };
  }

  static async getDriverPendingOrders(driver_id, queryParams) {
    const {
      search,
      sortBy = "order asc",
      page = 1,
      count = 10
    } = queryParams;

    const skipNo = (page - 1) * count;

    const query = {
      multipleAssignedDriver: { $in: [driver_id] },
      order_status: { $nin: ['Delivered', 'Declined'] }
    };

    const total = await Reserveorders.count(query);
    const pendingOrders = await Reserveorders.find(query)
      .populate('dispensary_id')
      .populate('addedBy')
      .sort({ order: 1, updatedAt: -1 })
      .skip(skipNo)
      .limit(count);

    for (const element of pendingOrders) {
      if (element.type != "ExpressPickup") {
        const cards = await MerrcoCards.find({ userId: element.addedBy.id });
        element.addedBy.paymentMethod = cards;
      }
    }

    return {
      data: pendingOrders,
      total: total,
    };
  }

  static async getDriverAcceptedOrders(driver_id, queryParams) {
    const {
      search,
      sortBy,
      page = 1,
      count = 10
    } = queryParams;

    const skipNo = (page - 1) * count;

    const query = {
      driver: driver_id,
      driver_request_status: 'accepted',
      order_status: {
        $in: ['Accepted', 'Inbound', 'Outbound', 'Arrieved']
      }
    };

    const total = await Reserveorders.count(query);
    const pendingOrders = await Reserveorders.find(query)
      .populate('dispensary_id')
      .populate('addedBy')
      .sort(sortBy)
      .skip(skipNo)
      .limit(count);

    for (const element of pendingOrders) {
      const cards = await MerrcoCards.find({ userId: element.addedBy.id });
      element.addedBy.paymentMethod = cards;
    }

    return {
      data: pendingOrders,
      total: total,
    };
  }

  static async getDriverDeliveredOrders(driver_id, queryParams) {
    const {
      search,
      sortBy,
      page = 1,
      count = 10,
      start,
      end
    } = queryParams;

    const skipNo = (page - 1) * count;

    const query = {
      driver: driver_id,
      driver_request_status: 'accepted',
      order_status: 'Delivered'
    };

    if (start && end) {
      const startOfDay = new Date(start);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(end);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.order_delivered_date = { $gte: startOfDay, $lte: endOfDay };
    }

    const total = await Reserveorders.count(query);
    const pendingOrders = await Reserveorders.find(query)
      .populate('dispensary_id')
      .populate('addedBy')
      .sort(sortBy)
      .skip(skipNo)
      .limit(count);

    let sum = 0;
    const matchDate = "2024-03-19T00:00:00.000Z";

    for (const order of pendingOrders) {
      const date1 = new Date(order.order_date);
      const date2 = new Date(matchDate);
      const usaTimeDate1 = date1.toLocaleString('en-US', { timeZone: 'America/Edmonton' });
      const usaTimeDate2 = date2.toLocaleString('en-US', { timeZone: 'America/Edmonton' });

      if (new Date(usaTimeDate1) > new Date(usaTimeDate2)) {
        sum += Number(order.delivery_charge || 0) +
          Number(order.tip || 0) +
          Number(order.promoDiscount || 0) +
          Number(order.tripBonus || 0);
      } else {
        sum += Number(order.delivery_charge || 0) +
          Number(order.tip || 0) +
          Number(order.promoDiscount || 0) + 4;
      }
    }

    return {
      totalEarning: sum,
      data: pendingOrders,
      total: total,
    };
  }

  static async acceptRejectOrder(id, driver_id, status) {
    let driverrequest_status = "accepted";

    if (status == 'rejected') {
      status = 'declined';
      driverrequest_status = 'declined';
    }

    const driver = await Users.findOne({ id: driver_id });
    const userId = driver ? driver.id : driver_id;
    const order = await Reserveorders.findOne({ id: id }).populate('dispensary_id');
    const multipleAssignedDriver = order.multipleAssignedDriver || [];

    let updatedOrder;

    if (status == 'declined') {
      let sr = order.multipleRejectedOrderDriver || [];

      if (sr && sr.length > 0) {
        if (!sr.includes(userId)) {
          sr.push(userId);
        }
        let multipleRejectedOrderDriverNew = sr;

        updatedOrder = await Reserveorders.update(
          { id: id },
          { multipleAssignedDriver: multipleAssignedDriver, multipleRejectedOrderDriver: multipleRejectedOrderDriverNew }
        );
      } else {
        if (multipleAssignedDriver && multipleAssignedDriver.length > 0) {
          const filteredNew = multipleAssignedDriver.filter(element => element !== userId);
          updatedOrder = await Reserveorders.update(
            { id: id },
            { multipleAssignedDriver: filteredNew, multipleRejectedOrderDriver: sr }
          );
        } else {
          throw new Error('Now, this order is not available for you.');
        }
      }
    } else {
      if (order && order.driver) {
        throw new Error('Order already accepted by other driver.');
      } else {
        const valueToCheck = driver ? driver.id : driver_id;

        if (multipleAssignedDriver && multipleAssignedDriver.length > 0 && multipleAssignedDriver.includes(valueToCheck)) {
          let multipleAssignedDriverData = [];
          multipleAssignedDriverData.push(valueToCheck);

          updatedOrder = await Reserveorders.update(
            { id: id },
            {
              driver_request_status: driverrequest_status,
              order_status: status,
              driver: driver ? driver.id : driver_id,
              multipleAssignedDriver: multipleAssignedDriverData
            }
          );

          if (order.type == "ExpressPickup") {
            let orderId = order.order_number;
            orderId = orderId.replace(/^puffski_/i, "");

            await orderServiceObj.webhookExpress({
              order_number: orderId,
              express_id: orderId,
              status: status.toLowerCase(),
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          throw new Error('Now, this order is not available for you.');
        }
      }
    }

    if (order.type != "ExpressPickup") {
      await this.acceptRejectEmailStore(
        order.order_number,
        status,
        order.dispensary_id.email,
        order.dispensary_id.name,
        driver.fullName
      );
    }

    return { message: `Order ${status} successfully.` };
  }

  static async markAsDeliver(id, driverId) {
    const order = await Reserveorders.findOne({ id: id });

    if (order.driver != driverId) {
      throw new Error('Now, this order is not available for you. Please close the app and start again. For more please contact to info@puffski.com');
    }

    const d = new Date();
    const deliveredDate = d.toLocaleString('en-US', { timeZone: 'America/Edmonton' });

    await Reserveorders.update(
      { id: id },
      { order_status: 'Delivered', order_delivered_date: deliveredDate }
    );

    const singleResult = await Reserveorders.findOne({ id: id });

    let driverMargin = 0;
    const matchDate = "2024-03-19T00:00:00.000Z";
    const date1 = new Date(singleResult.order_date);
    const date2 = new Date(matchDate);
    const usaTimeDate1 = date1.toLocaleString('en-US', { timeZone: 'America/Edmonton' });
    const usaTimeDate2 = date2.toLocaleString('en-US', { timeZone: 'America/Edmonton' });
    const usaTimeDate1Obj = new Date(usaTimeDate1);
    const usaTimeDate2Obj = new Date(usaTimeDate2);

    const limitDate = "2022-10-04T00:00:00.000Z";
    const limitDateCheck = new Date(limitDate);

    if (usaTimeDate1Obj.getTime() > usaTimeDate2Obj.getTime()) {
      driverMargin = Number(singleResult.delivery_charge || 0) +
        Number(singleResult.tip || 0) +
        Number(singleResult.promoDiscount || 0) +
        Number(singleResult.tripBonus || 0);
    } else {
      if (usaTimeDate1Obj.getTime() > limitDateCheck.getTime()) {
        driverMargin = Number(singleResult.delivery_charge || 0) +
          Number(singleResult.tip || 0) +
          Number(singleResult.promoDiscount || 0) + 4;
      } else {
        driverMargin = Number(singleResult.delivery_charge || 0) +
          Number(singleResult.tip || 0) +
          Number(singleResult.promoDiscount || 0);
      }
    }

    const puffskiMargin = Number(singleResult.instaleaf_margin || 0) -
      Number(singleResult.driverMargin || 0);
    const grossMargin = Number(puffskiMargin) / Number(singleResult.instaleaf_margin || 1);
    const newgross_margin = (grossMargin > 0 ? grossMargin : 0).toFixed(2);

    await Reserveorders.update(
      { id: singleResult.id },
      {
        puffski_margin: puffskiMargin,
        driver_margin: driverMargin,
        gross_margin: newgross_margin
      }
    );

    const notification = {
      notification: 'Your order has been delivered.',
      status: 'delivered',
      readStatus: false
    };

    await Notifications.update({ orderId: order.id }, notification);

    const user = await Users.findOne({ id: order.addedBy });

    if (user && user.push_token) {
      await FirebaseService.sendFireBaseNotification({
        push_token_array: user.push_token_array,
        token: user.push_token,
        notification: order.type == "ExpressPickup" ? "Your package has been delivered" : "Delivery complete.",
        id: id,
      });
    }

    let mobileNo = "";
    if (this.checkPlusSign(order.mobile)) {
      mobileNo = order.mobile;
    } else {
      mobileNo = "+1" + order.mobile;
    }

    await client.messages.create({
      body: order.type == "ExpressPickup" ? "Your package has been delivered" : "Delivery complete.",
      from: '+19787407098',
      to: mobileNo,
    });

    if (order.type == "ExpressPickup") {
      let orderId = order.order_number;
      orderId = orderId.replace(/^puffski_/i, "");

      await orderServiceObj.webhookExpress({
        order_number: orderId,
        express_id: orderId,
        status: order.status.toLowerCase(),
        timestamp: new Date().toISOString(),
      });
    }

    return { message: 'Order delivered successfully.' };
  }

  static async updateOrderByDriver(order_ids, status, driverId) {
    if (!order_ids || order_ids.length === 0) {
      throw new Error('Order ids required');
    }

    await async.each(order_ids, async (orderId) => {
      const order = await Reserveorders.findOne({ id: orderId });

      if (order.driver != driverId) {
        throw new Error('Now, this order is not available for you. Please close the app and start again. For more please contact to info@puffski.com');
      }

      await Reserveorders.update(
        { id: orderId },
        { order_status: status }
      );

      const user = await Users.findOne({ id: order.addedBy });
      let mobileNo = "";
      if (this.checkPlusSign(order.mobile)) {
        mobileNo = order.mobile;
      } else {
        mobileNo = "+1" + order.mobile;
      }

      if (status === 'Inbound') {
        if (user && user.push_token) {
          await FirebaseService.sendFireBaseNotification({
            push_token_array: user.push_token_array,
            token: user.push_token,
            notification: order && order.type == "ExpressPickup" ?
              "Order confirmed, courier is inbound to pick-up your package" :
              "Delivery order confirmed, courier heading to store.",
            id: orderId,
          });
        }

        await client.messages.create({
          body: order && order.type == "ExpressPickup" ?
            "Order confirmed, courier is inbound to pick-up your package." :
            "Delivery order confirmed, courier heading to store.",
          from: '+19787407098',
          to: mobileNo,
        });
      } else if (status === 'Outbound') {
        if (user && user.push_token) {
          await FirebaseService.sendFireBaseNotification({
            push_token_array: user.push_token_array,
            token: user.push_token,
            notification: order && order.type == "ExpressPickup" ?
              "Package is picked up and on the way." :
              "Order is picked up and on the way.",
            id: orderId,
          });
        }

        await client.messages.create({
          body: order && order.type == "ExpressPickup" ?
            "Package is picked up and on the way." :
            "Order is picked up and on the way.",
          from: '+19787407098',
          to: mobileNo,
        });
      } else if (status === 'Arrived') {
        if (user && user.push_token) {
          await FirebaseService.sendFireBaseNotification({
            push_token_array: user.push_token_array,
            token: user.push_token,
            notification: order && order.type == "ExpressPickup" ?
              "Your package has arrived." :
              "Your courier has arrived.",
            id: orderId,
          });
        }

        await client.messages.create({
          body: order && order.type == "ExpressPickup" ?
            "Your package has arrived." :
            "Your courier has arrived.",
          from: '+19787407098',
          to: mobileNo,
        });
      }

      if (order.type == "ExpressPickup") {
        let orderIdNum = order.order_number;
        orderIdNum = orderIdNum.replace(/^puffski_/i, "");

        await orderServiceObj.webhookExpress({
          order_number: orderIdNum,
          express_id: orderIdNum,
          status: status.toLowerCase(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    let message = 'Order updated successfully.';
    if (status === 'Collected by driver') {
      message = 'Order collected successfully.';
    } else if (status === 'On Route') {
      message = 'Order updated successfully.';
    } else if (status === 'Reached at customer') {
      message = 'Order updated successfully.';
    }

    return { message: message };
  }

  static async signinDriver(data) {
    let query = {};

    if (!data.username || data.username == '') {
      throw new Error(constantObj.messages.USERNAME_REQUIRED);
    }

    if (!data.password || data.password == '') {
      throw new Error(constantObj.messages.PASSWORD_REQUIRED);
    }

    query.$or = [{ username1: data.username }, { email: data.username }];
    query.isDeleted = false;
    query.roles = 'Driver';

    const user = await Users.findOne(query);

    if (!user) {
      throw new Error(constantObj.messages.WRONG_USERNAME);
    }

    if (user.roles == 'U' && user.isVerified != 'Y') {
      throw new Error(constantObj.messages.USERNAME_NOT_VERIFIED);
    }

    if (user.status == 'deactive') {
      throw new Error(constantObj.messages.USERNAME_INACTIVE);
    }

    if (!bcrypt.compareSync(data.password, user.password)) {
      if (!bcrypt.compareSync((data.password).toLowerCase(), user.password)) {
        throw new Error(constantObj.messages.WRONG_PASSWORD);
      }
    }

    const token = await Tokens.generateToken({
      client_id: user.id,
      user_id: user.id,
    });

    const inputData = {
      device_type: data.device_type || 'Web',
      user: user.id,
      access_token: token.access_token
    };

    if (data.gcm_id) inputData.gcm_id = data.gcm_id;
    if (data.device_token) inputData.device_token = data.device_token;

    await Userslogin.create(inputData);

    const lastLoginUpdate = {
      lastLogin: new Date(),
      status: 'active'
    };

    if (data.domain == 'mobile') {
      lastLoginUpdate.deviceToken = data.device_token;
      lastLoginUpdate.domain = data.domain;
      lastLoginUpdate.device_type = data.device_type;
    }

    if (data.push_token) {
      let push_token_array = user.push_token_array || [];
      if (!push_token_array.includes(data.push_token)) {
        push_token_array.push(data.push_token);
      }
      lastLoginUpdate.push_token_array = push_token_array;
      lastLoginUpdate.push_token = data.push_token;
    }

    lastLoginUpdate.usersloginCount = (user.usersloginCount || 0) + 1;

    await Users.update({ id: user.id }, lastLoginUpdate);

    user.access_token = token.access_token;
    user.refresh_token = token.refresh_token;

    return user;
  }

  static async driverForgotPassword(username) {
    if (!username || username == '') {
      throw new Error(constantObj.messages.USERNAME_REQUIRED);
    }

    const driver = await Users.findOne({
      username1: username,
      isDeleted: false,
    });

    if (!driver) {
      throw new Error(constantObj.messages.WRONG_USERNAME);
    }

    const password = this.generatePassword();
    const encryptedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    await Users.update(
      { id: driver.id },
      { encryptedPassword: encryptedPassword }
    );

    await this.forgotEmail(driver.email, username, password);

    return { message: constantObj.messages.CHECK_EMAIL };
  }

  static async addDriverStatus(data) {
    const currentDateString = this.getCurrentDateString();
    data.scheduleDate = currentDateString;

    const scheduleCheck = await DriverStatus.findOne({
      addedBy: data.addedBy,
      scheduleDate: data.scheduleDate,
    });

    if (scheduleCheck) {
      throw new Error("Already status added");
    }

    await DriverStatus.create(data);

    return { message: "Status added successfully." };
  }

  static async updateDriverStatus(id, scheduleStatus) {
    const scheduleCheck = await DriverStatus.findOne({ id: id });

    if (!scheduleCheck) {
      throw new Error("Data not found");
    }

    await DriverStatus.update({ id: id }, { scheduleStatus: scheduleStatus });

    return { message: "Status updated successfully." };
  }

  static async getDriverStatus(driverId) {
    const currentDateString = this.getCurrentDateString();

    const scheduleCheck = await DriverStatus.findOne({
      addedBy: driverId,
      scheduleDate: currentDateString,
    });

    if (!scheduleCheck) {
      throw new Error("Data not found");
    }

    return scheduleCheck;
  }
}

module.exports = DriverService;