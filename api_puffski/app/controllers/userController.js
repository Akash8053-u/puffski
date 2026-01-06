const { sendCommunityConnectEmail, communityContactUSService } = require("../Emails/communityEmail.js");
const {
  sendContactUsEmail,
  sendLsrContactUsEmail,
  sendFeedbackEmail,
} = require("../Emails/contactEmail.js");
const { sendUserVerificationEmail, sendVerifyRequestEmail } = require("../Emails/emailVerifyLinks.js");
const { sendQuestion, addStrainEmail } = require("../Emails/questionEmail.js");
const validations = require("../Validations/index");
const db = require("../models/index.js");
const services = require("../services/index");
const service = require("../services/index");
const {
  updateUserService,
  getUserInfoService,
} = require("../services/userServices.js");
const constants = require("../utils/constants.js");

async function register(req, res) {
  try {
    // Call service to register user
    const result = await service.UserService.registerUser(req.body);

    if (!result.success) {
      return res.status(result.error.code || 400).json(result);
    }

    // Try sending email but don't break registration if it fails
    if (result.data && result.data.email) {
      try {
        await sendEmail(
          result.data.email,
          "Welcome",
          "Your account has been created"
        );
      } catch (emailErr) {
        console.warn("Email failed to send:", emailErr.message);
        // You can optionally log the email failure in DB
      }
    }

    // Successful registration response
    return res.status(200).json(result);
  } catch (err) {
    console.error("registerUser error:", err);

    // Only send error response if headers not already sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: "Internal Server Error" },
      });
    }
  }
}
async function signinUser(req, res) {
  try {
    const data = req.body;

    // Call the service
    const result = await service.UserService.signinUserService(data);

    // If service returns error object
    if (!result.success) {
      return res.status(result.error.code || 400).json(result);
    }

    // Success response
    return res.status(200).json({
      success: true,
      code: 200,
      message: constants.messages.SUCCESSFULLY_LOGGEDIN,
      data: result.data,
    });
  } catch (err) {
    console.error("signinUser controller error:", err);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: "Internal Server Error" },
    });
  }
}

async function updateUser(req, res) {
  try {
    const result = await service.UserService.updateUserService(req, res);
    if (result)
      return res.status(200).json({
        status: true,
        message: constants.user.USER_UPDATED,
      });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: constants.user.USER_UPDATION_ISSUE,
    });
  }
}

async function userProfileData(req, res) {
  try {
    const id = req.params.id;

    const user = await service.UserService.getUserProfileService(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}

async function detailByUsername(req, res) {
  try {
    const username = req.params.username;

    const user = await service.UserService.detailByUsernameService(username);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: constants.messages.NOT_FOUND,
        },
      });
    }

    if (user.userVerified === true) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: constants.messages.USER_ALREADY_VERIFIED,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 500, message: err.message },
    });
  }
}

async function updateUsername(req, res) {
  try {
    const result = await service.UserService.updateUsernameService(req);

    if (result.available) {
      return res.status(200).json({
        status: true,
        message: "Username available",
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Username already in use",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function getUserInfo(req, res) {
  try {
    const userId = req.params.id;

    const userInfo = await service.UserService.getUserInfoService(userId);

    if (!userInfo) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: "User not found." },
      });
    }

    return res.status(200).json({
      success: true,
      code: 200,
      userInfo,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: err.message },
    });
  }
}

async function loginUser(req, res, next) {
  try {
    const validation_result =
      await validations.userValidation.loginUserValidation(req, res);
    if (!validation_result.success) {
      throw new Error(constants.VALIDATION_ERR);
    }
    const result = await service.UserService.loginUserService(req, res);
    return res.status(201).json({
      code: 201,
      success: {
        status: true,
        result: result,
      },
    });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 401;
    next(err);
  }
}

async function forgotPassword(req, res) {
  try {
    const validation_result =
      await validations.userValidation.forgotPasswordValidation(req, res);
    if (!validation_result.success) {
      throw new Error(constants.VALIDATION_ERR);
    }

    const result = await service.UserService.forgotPasswordService(req, res);
    return res.status(201).json({
      code: 201,
      success: {
        status: true,
        message: "Email Sent Successfully",
      },
    });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 401;
    next(err);
  }
}

// async function resetPassword(req,res){
//   try {

//   } catch () {

//   }
// }

// const lsrRegisterUser = async (req, res) => {
//   try {
//     const result = await service.UserService.lsrRegisterUser(req.body);

//     if (!result.success) {
//       return res.status(result.error.code || 400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error("LSR Controller Error:", err);
//     return res.status(500).json({
//       success: false,
//       error: { code: 500, message: "Internal Server Error" },
//     });
//   }
// };

async function changePassword(req, res) {
  try {
    const userId = req.user.id; // assuming you get user id from auth middleware
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const result = await service.UserService.changePasswordService(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.code || 500).json({
      success: false,
      error: {
        code: err.code || 500,
        message: err.message || "Something went wrong",
        key: err.key || null,
      },
    });
  }
}

async function contactUs(req, res) {
  try {
    await sendContactUsEmail(req.body);

    return res.status(200).json({
      success: true,
      message: "Mail has been sent successfully.",
    });
  } catch (err) {
    console.error("ContactUs Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

async function lsrContactUs(req, res) {
  try {
    await sendLsrContactUsEmail(req.body);

    return res.status(200).json({
      success: true,
      message: "Mail has been sent successfully.",
    });
  } catch (err) {
    console.error("LSR ContactUs Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

async function feedback(req, res) {
  try {
    const { regarding, feedback, rating } = req.body;

    // Validation
    if (!regarding || regarding.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: "Feedback point required." },
      });
    }

    if (!feedback || feedback.trim() === "") {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: "Feedback required." },
      });
    }

    // Call the service to send email
    await sendFeedbackEmail({ regarding, feedback, rating });

    return res.status(200).json({
      success: true,
      code: 200,
      data: { message: "Feedback submitted successfully." },
    });
  } catch (err) {
    console.error("Feedback Error:", err);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: err.message },
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const id = req.params.id || req.identity.id;

    await service.UserService.deleteUserAccount(id);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (err) {
    console.error("Delete Account Error:", err);
    return res.status(400).json({
      success: false,
      error: { code: 400, message: err.message || "" },
    });
  }
}

async function askQuestion(req, res) {
  try {
    await sendQuestion(req.body);

    return res.status(200).json({
      success: true,
      message:
        constants.messages.QUESTION_SUCCESS ||
        "Question submitted successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: err.message || "Something went wrong" },
    });
  }
}

async function resetPassword(req, res) {
  try {
    const data = req.body; // Expect: { id, newPassword, confirmPassword, type }

    const result = await service.UserService.setPassword(data);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
        details: err.message,
      },
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.body.id; // ID of user to update
    const data = req.body;
    const userRole = req.user.roles; // Assuming auth middleware sets req.user

    const result = await service.UserService.updateUserProfileService(
      userId,
      data,
      userRole
    );

    return res.status(result.code).json(result);
  } catch (err) {
    return res.status(err.code || 500).json({
      success: false,
      error: {
        code: err.code || 500,
        message: err.message || "User update failed",
      },
    });
  }
}

async function addStrainRequest(req, res) {
  try {
    const { product, producer } = req.body;

    if (!product || !producer) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Product and Producer are required." },
      });
    }

    await addStrainEmail({ product, producer });

    return res.status(200).json({
      success: true,
      code: 200,
      data: { message: "Email sent to admin successfully." },
    });
  } catch (err) {
    console.error("AddStrain Error:", err);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: "" + err },
    });
  }
}

async function userVerification(req, res) {
  try {
    const verifyEmail = req.body.email || req.body.userName;
    if (!verifyEmail) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: constants.messages.USERNAME_EMAIL_REQUIRED,
        },
      });
    }

    const user = await db.User.findOne({
      email: verifyEmail,
      isDeleted: false,
    });
    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constants.messages.INVALID_USER },
      });
    }

    if (user.isVerified === "N") {
      // Update user as verified
      await db.User.findByIdAndUpdate(
        { _id: user._id },
        { isVerified: "Y", date_verified: new Date(), status: "active" },
        { new: true }
      );

      // Prepare verification URL
      const verifyURL = `${
        process.env.Puffski_FRONT_WEB_URL + "verify/" + user.email
      }`;
      console.log(verifyURL);

      // Send verification email
      const emailResult = await sendUserVerificationEmail({
        username1: user.username1,
        email: user.email,
        verifyURL,
      });

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          error: { code: 500, message: emailResult.error },
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Verification link sent to your registered email. Please check your mailbox.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "User already verified.",
      });
    }
  } catch (err) {
    console.error("User Verification Error:", err);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: err.message },
    });
  }
}

async function verify(req, res) {
  try {
    const verifyEmail = req.params.email;

    if (!verifyEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Email parameter is required" },
      });
    }

    // Find user by email
    const user = await db.User.findOne({
      email: verifyEmail,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: "Invalid User" },
      });
    }

    // Convert stored code to number
    const code = Number(user.code);

    // If user is not verified → verify them
    if (user.isVerified === "N") {
      await db.User.update(
        {
          isVerified: "Y",
          date_verified: new Date(),
          status: "active",
        },
        { where: { id: user.id } }
      );
    }

    return res.redirect(
      `${process.env.Puffski_FRONT_WEB_URL}?email=${user.code}&verify=true`
    );
  } catch (err) {
    console.error("Verify Error:", err);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: "Something went wrong: " + err.message },
    });
  }
}

async function lsrVerify(req, res) {
  try {
    const verifyEmail = req.params.email;

    if (!verifyEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "Email parameter is required" },
      });
    }

    const result = await service.UserService.verifyUserByEmail(verifyEmail);

    if (!result.success) {
      return res.status(result.error.code).json(result);
    }

    const { code } = result;

    return res.redirect(
      `${process.env.LSR_FRONT_WEB_URL}?email=${code}&verify=true`
    );
  } catch (err) {
    console.error("LSR Verify Controller Error:", err);
    return res.status(500).json({
      success: false,
      error: { code: 500, message: "Something went wrong: " + err.message },
    });
  }
}

async function showRoom(req, res) {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: "User ID is required" },
      });
    }

    const user = await service.UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("showRoom Error:", error);
    return res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
}

async function getDashboardData(req, res) {
  try {
    const result = await service.UserService.getDashboardData();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("getDashboardData Error:", error);
    return res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
}


async function updateFCMData (req, res)  {
  const { id, push_token } = req.body;

  const result = await service.UserService.updateFCMData( req,res);

  if (!result.success) {
    return res.status(result.error.code || 400).json(result);
  }

  return res.status(200).json(result);
};




async  function verifyRequest(req, res){
  try {
    const user_id = req.body.user_id;
    const user = await db.User.findOne({ _id: user_id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await sendVerifyRequestEmail({
      username: user.username1,
      email: user.email
    });

    return res.status(200).json({
      success: true,
      message: "Request is successfully sent to verify account.",
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};




 async function index(req, res) {
    try {
      const data = req.body;
      const result = await service.UserService.adminSideRegistration(data);
      if (!result.success) {
        return res.status(result.error?.code || 400).json(result);
      }
      return res.status(200).json(result);
    } catch (err) {
      console.error("Controller error:", err);
      return res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

async function communityConnect(req, res) {
  try {
    const { username1: username, email, phone, roles, additionalNotes } = req.body;

    let roleLabel = '';
    if (roles === 'DR') roleLabel = 'Doctor';
    else if (roles === 'B') roleLabel = 'Brand';
    else if (roles === 'D') roleLabel = 'Cannabis Store';

    const result = await sendCommunityConnectEmail({
      username,
      email,
      phone,
      role: roleLabel,
      additionalNotes,
    });

    return res.status(200).json({
      success: true,
      code: 200,
      data: { message: result.message },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: err.message },
    });
  }
}

  async function communityContactUS(req, res) {
    const { name, email, message } = req.body;

    try {
      const result = await communityContactUSService({ name, email, message });

      if (result.success) {
        return res.status(200).json({
          success: true,
          code: 200,
          data: { message: 'Email sent to admin successfully.' },
        });
      } else {
        throw result.error;
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  }

async function setPasswordForStores(req, res) {
  try {
    const result = await service.UserService.setPasswordForStores(req.body);
    return res.json(result);
  } catch (err) {
    console.error("Error in setPasswordForStores:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}

 async function lsrRegisterUser(req, res) {
  try {
    const data = req.body;
    const context = {};

    const result = await service.UserService.lsrRegisterUserService(data, context);

    // Respond with the result from the service
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in LSR register controller:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Internal server error',
        details: error.message,
      },
    });
  }
};

async function getAllUsers(req, res) {
  try {
    const filters = req.query;
    const result = await service.UserService.getAllUsersService(filters);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function getAllUsersNew(req, res) {
  try {
    const result = await service.UserService.getAllUsersnewService(req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}


async function otpVerify(req,res){
  try {
    const result =await service.UserService.otpVerifyService(req,res)
    return res.status(200).json({code:200,error:{
      status:true,
      message:constants.messages.OTP_SUCCESS,
    
    } })
  } catch (error) {
     const err = new error
     err.status =401
     next(err)

  }
}




 async function  lsrCommonOTPSend(req, res)  {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: { message: "Email is required" },
        });
      }

      const result = await service.UserService.lsrCommonOTPSend(email);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { message: err.message },
      });
    }
  }





const getAllUsersUpdate = async (req, res) => {
  try {
    const params = {
      search: req.query.search,
      sortBy: req.query.sortBy,
      page: req.query.page,
      count: req.query.count,
      status: req.query.status,
      roles: req.query.roles,
      userroles: req.query.userroles
    };

    const result = await service.UserService.getAllUsersUpdate(params);

    return res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('Error in getAllUsersUpdate:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

 async function getVerifiedAccounts(req, res) {
  try {
  
    const page = Number(req.query.page) || 1;
    const count = Number(req.query.count) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const sortBy = req.query.sortBy ? req.query.sortBy.trim() : 'ageVerifiedAt desc';

    const skipNo = (page - 1) * count;

    // Base query for verified users
    const query = {
      ageVerifiedBy: req.identity.id,
      isDeleted: false
    };

    // Apply search filter if provided
    if (search) {
      query.$or = [
        { username1: { like: `%${search}%` } },
        { fullName: { like: `%${search}%` } }
      ];
    }

    // Get total number of matching users
    const total = await db.User.count(query);

    // Fetch users with pagination and sorting
    const users = await db.User.find(query)
      .sort(sortBy)
      .skip(skipNo)
      .limit(count);

    // Return response
    return res.status(200).json({
      success: true,
      data: users,
      total
    });

  } catch (err) {
    console.error('Error in getVerifiedAccounts:', err);
    return res.status(400).json({
      success: false,
      error: { code: 400, message: err.toString() }
    });
  }
};


async function otpSend(req, res)  {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });

    const result = await service.UserService.otpSendService(email);
    return res.status(result.success ? 200 : 400).json(result);

  } catch (err) {
    console.error("OTP Send Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





async function commonOTPSend(req, res) {
  const { email } = req.body;
  const result = await service.UserService.commonsendOTPService(email);
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(result.error?.code || 500).json(result);
  }
}


async function verifyUserAccount(req, res) {
  try {

    const id = req.body.id;         
    const body = req.body;
    const identity = req.identity;


    await service.UserService.verifyUserAccount(id, body, identity);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: err.message },
    });
  }
}



async function autoLogin(req, res) {
  try {
    const data = req.body;
    const result = await service.UserService.autoLoginService(data);

    if (!result.success) {
      return res.status(result.error.code || 400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 500, message: err.message || 'Internal Server Error' },
    });
  }
}

const ageVerification = async (req, res) => {
  try {
    const id = req.body.id; // Corrected from req.param('id')
    const queryData = req.query;

    const result = await service.UserService.ageVerificationService(id, queryData, req.identity.id);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully for view products.',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: err.message || '' + err },
    });
  }
};


const signin = async (req, res) => {
  try {
    const data = req.body;

    const result = await service.UserService.signinService(data);

    if (!result.success) {
      return res.status(result.error?.code || 400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 500, message: err.message || '' + err },
    });
  }
};




async function signinSocial (req, res,next) {
  try {
    const result =  await service.UserService.signupSocialMedia(req.body);
    return res.status(result.code).json(result);
  } catch (error) {
    next(error);
  } 
};




module.exports = {
  signin,
  loginUser,
  getVerifiedAccounts,
  getAllUsersNew,
  forgotPassword,
register,
  signinUser,
  updateUser,
  userProfileData,
  detailByUsername,
  updateUsername,
  getUserInfo,
  changePassword,
  updateProfile,
  resetPassword,
  contactUs,
  lsrContactUs,
  feedback,
  deleteAccount,
  askQuestion,
  addStrainRequest,
  userVerification,
  verify,
  lsrVerify,
  showRoom,
  getDashboardData,
  updateFCMData,
  verifyRequest,
  index,
  communityConnect,
  communityContactUS,
  setPasswordForStores,
  lsrRegisterUser,
  getAllUsers,
  getAllUsersUpdate,
  otpVerify,
  lsrCommonOTPSend,
  otpSend,
  commonOTPSend,
  verifyUserAccount,
  autoLogin,
ageVerification,
signinSocial
};
