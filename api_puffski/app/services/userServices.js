const db = require("../models");
const constants = require("../utils/constants");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpTemplate = require("../Emails/otpEmail");
const TokenService = require("./tokenService");
const EmailService = require("../controllers/smtpController");
const twilio = require("twilio");
const axios = require("axios");
const slackClient = require("@slack/web-api").WebClient;

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const slack = new slackClient(process.env.SLACK_TOKEN);
const channelId = process.env.SLACK_CHANNEL_ID;
const commonService = require("./commonService");
const ActiveCampaign = require("./activeCampaignService");
const { verificationMail } = require("../Emails/onBoardingEmail");
const { generateOTP } = require("../utils/helper");

const { sendEmail } = require("../controllers/smtpController");
const {
  onboardingVerificationEmail,
  emailChangePassword,
} = require("../Emails/onBoardingEmail");
const {
  userEmailVerifyLink,
  lsrEmailVerifyLink,
} = require("../Emails/emailVerifyLinks");
// ----------------------- SIGNUP SERVICE -----------------------

const socialUserAccess = async (client_id, user) => {
  if (!client_id) {
    return {
      success: false,
      code: 401,
      message: "Client Id is missing",
    };
  }

  const token = await TokenService.generateToken({
    client_id,
    user_id: user.id,
  });

  return {
    success: true,
    code: 200,
    message: constants.messages.SOCIAL_USER_LOGGED_IN,
    key: "SOCIAL_USER_LOGGED_IN",
    data: {
      ...user.toObject(), // prevents DB mutation
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    },
  };
};

async function SignupUserService(req, res) {
  try {
    const user = req.body;
    console.log(user);

    const existing = await db.User.findOne({
      email: user.email,
      isDeleted: false,
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: constants.messages.EXIST_ERR });
    }

    user.password = await bcrypt.hash(user.password, 10);
    const newUser = await db.User.create(user);

    return res.status(200).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
async function signinUserService(data) {
  try {

    if (!data.username1) {
      return {
        success: false,
        error: {
          code: 400,
          message: constants.messages.USERNAME_REQUIRED,
          key: "USERNAME_REQUIRED",
        },
      };
    }

    if (!data.password) {
      return {
        success: false,
        error: {
          code: 400,
          message: constants.messages.PASSWORD_REQUIRED,
          key: "PASSWORD_REQUIRED",
        },
      };
    }

    // Build query
    const query = {
      isDeleted: false,
      roles: { $in: ["U", "D", "DRIVER", "B", "DR", "STOREADMIN"] },
      // $or: [{ username1: data.username1 }, { email: data.username1 }],
    };

    const user = await db.User.findOne(query);
    if (!user) {
      return {
        success: false,
        error: {
          code: 404,
          message: constants.messages.WRONG_USERNAME,
          key: "WRONG_USERNAME",
        },
      };
    }
console.log(user,"userdadgghr")
    // Verification checks
    if (user.roles === "U" && user.isVerified !== "Y") {
      return {
        success: false,
        error: {
          code: 404,
          isVerified: false,
          email: user.email,

          key: "USERNAME_NOT_VERIFIED",
        },
      };
    }

    if (
      user.status === "deactive" ||
      (user.status !== "active" && user.isVerified !== "Y")
    ) {
      return {
        success: false,
        error: {
          code: 404,
          message: constants.messages.USERNAME_INACTIVE,
          key: "USERNAME_INACTIVE",
        },
      };
    }

    // Password check
  const isPasswordValid = await bcrypt.compare(
  data.password.trim(),
  user.password
);

if (!isPasswordValid) {
  return {
    success: false,
    error: {
      code: 401,
      message: constants.messages.WRONG_PASSWORD,
      key: "WRONG_PASSWORD",
    },
  };
}

    // Prepare login data
    const loginData = {
      user: user.id,
      device_type: data.device_type || "Web",
    };
    if (data.gcm_id) loginData.gcm_id = data.gcm_id;
    if (data.device_token) loginData.device_token = data.device_token;

    // Generate token
    const token = await TokenService.generateToken({
      client_id: user.id,
      user_id: user.id,
    });

    user.access_token = TokenService.access_token;
    user.refresh_token = TokenService.refresh_token;
    loginData.access_token = TokenService.access_token;

    // Save login record
    await db.UserLogin.create(loginData);

    // Update last login info
    const lastLoginUpdate = {
      lastLogin: new Date(),
      status: "active",
    };

    if (data.domain === "mobile") {
      lastLoginUpdate.deviceToken = data.device_token;
      lastLoginUpdate.domain = data.domain;
      lastLoginUpdate.device_type = data.device_type;
    }

    if (data.push_token) {
      const pushTokenArray = user.push_token_array || [];
      if (!pushTokenArray.includes(data.push_token))
        pushTokenArray.push(data.push_token);
      lastLoginUpdate.push_token_array = pushTokenArray;
      lastLoginUpdate.push_token = data.push_token;
    }

    lastLoginUpdate.usersloginCount = (user.usersloginCount || 0) + 1;

    await db.User.updateOne({ id: user.id }, lastLoginUpdate);
    console.log("token:", token);
    return {
      success: true,
      code: 200,
      message: constants.messages.SUCCESSFULLY_LOGGEDIN,
      data: user,
    };
  } catch (err) {
    console.error("signinUser error:", err);
    return {
      success: false,
      error: { code: 500, message: "Internal Server Error" },
    };
  }
}
// ----------------------- LOGIN SERVICE -----------------------
async function loginUserService(req, res) {
  try {
    const { Email, password } = req.body;

    const user = await db.User.findOne({ Email, isDeleted: false });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: constants.USER.NOT_FOUND });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: constants.USER.INCORRECT_PASS });

    const token = jwt.sign(
      { _id: user._id, Email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

// ----------------------- FORGOT PASSWORD -----------------------
async function forgotPasswordService(req, res) {
  try {
    const { Email } = req.body;

    const user = await db.User.findOne({ Email, isDeleted: false });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: constants.USER.NOT_FOUND });

    await verificationMail({ Email });

    return res.status(200).json({ success: true, message: "Reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

// ----------------------- RESET PASSWORD -----------------------
async function resetPasswordService(req, res) {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // you must decide how reset token identifies user
    // Example: req.user.Email (from middleware)

    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

async function registerUser(data) {
  try {
    console.log("registerUser service called with data:", {
      email: data.email,
      username1: data.username1,
      roles: data.roles,
    });

    if (!data) {
      return {
        success: false,
        error: { code: 400, message: "Invalid data" },
      };
    }

    // Validate required fields
    if (!data.email) {
      return {
        success: false,
        error: { code: 400, message: "Email is required" },
      };
    }

    if (!data.password) {
      return {
        success: false,
        error: { code: 400, message: "Password is required" },
      };
    }

    // Normalize data
    data.email = data.email?.toLowerCase().trim();
    data.username1 = data.username1?.toLowerCase().trim() || data.email;
    data.username = data.username?.toLowerCase().trim() || data.email;
    data.roles = data.roles || "U";

    console.log("Normalized data:", {
      email: data.email,
      username1: data.username1,
      roles: data.roles,
    });

    // Check if user already exists by EMAIL
    const existingByEmail = await db.User.findOne({
      email: data.email,
      isDeleted: false,
    });

    if (existingByEmail) {
      console.log("User with this email already exists:", data.email);
      return {
        success: false,
        error: {
          code: 409,
          message: "Email already exists",
          key: "EMAIL_EXIST",
        },
      };
    }

    // Check if user already exists by USERNAME1
    const existingByUsername = await db.User.findOne({
      username1: data.username1,
      isDeleted: false,
    });

    if (existingByUsername) {
      console.log("Username already taken:", data.username1);
      return {
        success: false,
        error: {
          code: 409,
          message:
            "Username already taken. Please choose a different username.",
          key: "USERNAME_EXIST",
        },
      };
    }

    // Generate unique code
    const code = commonService?.getUniqueCode
      ? commonService.getUniqueCode()
      : Math.floor(100000 + Math.random() * 900000);
    data.code = code;
    data.date_registered = new Date();
    data.status = "inactive";
    data.isVerified = "N";
    data.userType = data.userType || "puffski";

    // Hash password
    try {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
      console.log("Password hashed successfully");
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      return {
        success: false,
        error: { code: 500, message: "Error processing password" },
      };
    }

    // Create user
    console.log("Creating user with data:", {
      email: data.email,
      username1: data.username1,
      roles: data.roles,
      status: data.status,
    });

    let newUser;
    try {
      newUser = await db.User.create(data);
      console.log("User created successfully:", newUser._id);
    } catch (createError) {
      console.error("Error creating user in database:", createError);

      // Handle duplicate key errors
      if (createError.code === 11000) {
        // Parse which field caused the duplicate
        const keyValue = createError.keyValue || {};

        if (keyValue.username1) {
          return {
            success: false,
            error: {
              code: 409,
              message: `Username '${keyValue.username1}' is already taken. Please choose a different username.`,
              key: "USERNAME_EXIST",
            },
          };
        } else if (keyValue.email) {
          return {
            success: false,
            error: {
              code: 409,
              message: "Email already exists",
              key: "EMAIL_EXIST",
            },
          };
        } else {
          return {
            success: false,
            error: {
              code: 409,
              message: "User already exists with these details",
            },
          };
        }
      }

      // Handle validation errors
      if (createError.name === "ValidationError") {
        const errors = Object.values(createError.errors).map(
          (err) => err.message,
        );
        return {
          success: false,
          error: {
            code: 400,
            message: `Validation error: ${errors.join(", ")}`,
          },
        };
      }

      // Generic error
      return {
        success: false,
        error: {
          code: 500,
          message: "Failed to create user. Please try again.",
          details:
            process.env.NODE_ENV === "development"
              ? createError.message
              : undefined,
        },
      };
    }

    // Send verification email
    try {
      const verifyURL = `${process.env.Puffski_BACK_WEB_URL || "http://localhost:3000"}/verify/${encodeURIComponent(data.email)}?code=${code}`;
      const emailHTML = onboardingVerificationEmail({
        username1: data.username1,
        email: data.email,
        verifyURL,
      });

      await sendEmail(data.email, "Verify your Puffski account", emailHTML);
      console.log("Verification email sent to:", data.email);
    } catch (emailError) {
      console.warn("Failed to send verification email:", emailError.message);
      // Continue - email failure shouldn't fail registration
    }

    return {
      success: true,
      message:
        "User registered successfully. Please check your email for verification.",
      data: {
        userId: newUser._id,
        email: newUser.email,
        username: newUser.username1,
        roles: newUser.roles,
      },
    };
  } catch (err) {
    console.error("Register user error:", err);
    return {
      success: false,
      error: {
        code: 500,
        message: "Internal Server Error",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
    };
  }
}

const updateUserService = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedUser = await db.User.findByIdAndUpdate(
      { _id: id, isd },
      req.body,
      {
        new: true, // return updated user
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return updatedUser;
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: err.message,
    });
  }
};

async function updateUsernameService(req) {
  const username1 = req.body.username1;

  const existingUser = await db.User.findOne({ username1 });

  if (existingUser) {
    return { available: false };
  }

  return { available: true };
}

async function getUserProfileService(id) {
  const user = await db.User.findById(id).lean();

  if (!user) return null;

  // Attach default shipping address info
  if (user.shippingDetail && user.shippingDetail.length > 0) {
    const defaultAddress = user.shippingDetail.find(
      (a) => a.isDefault === true,
    );

    if (defaultAddress) {
      user.address = defaultAddress.address1;
      user.city = defaultAddress.city;
      user.pincode = defaultAddress.pincode;
    }
  }

  return user;
}

async function getUserInfoService(userId) {
  // Find user
  const user = await db.User.findById(userId).lean();
  if (!user) return null;

  // Favourite stores
  const favStores = await db.Favourite.find({
    addedBy: userId,
    type: "dispensary",
  })
    .sort({ createdAt: -1 })
    .populate("item_id")
    .lean();

  // Favourite products
  const favProducts = await Favourite.find({
    addedBy: userId,
    type: "product",
  })
    .sort({ createdAt: -1 })
    .populate("product_id")
    .lean();

  // Attach favStores & favProducts to user object
  return {
    ...user,
    favStores,
    favProducts,
  };
}

async function changePasswordService(
  userId,
  currentPassword,
  newPassword,
  confirmPassword,
) {
  if (!newPassword || newPassword.trim() === "") {
    throw {
      code: 400,
      message: constants.user.PASSWORD_REQUIRED,
      key: "NEWPASSWORD_REQUIRED",
    };
  }

  const user = await db.User.findById(userId);
  if (!user) {
    throw {
      code: 404,
      message: "User not found",
    };
  }

  // Check if current password is correct
  const isCurrentValid =
    bcrypt.compareSync(currentPassword, user.encryptedPassword) ||
    bcrypt.compareSync(currentPassword.toLowerCase(), user.encryptedPassword);

  if (!isCurrentValid) {
    throw {
      code: 400,
      message: constants.messages.CURRENT_PASSWORD,
      key: "CURRENT_PASSWORD",
    };
  }

  // Check if new password matches confirm password
  if (newPassword !== confirmPassword) {
    throw {
      code: 400,
      message: "New password and confirm password do not match",
      key: "WRONG_PASSWORD",
    };
  }

  // Hash the new password
  const encryptedPassword = bcrypt.hashSync(
    newPassword,
    bcrypt.genSaltSync(10),
  );
  const updatedDate = new Date();

  // Save to UpdatedPassword collection
  const passwordInsert = {
    updatedPassword: newPassword,
    user: userId,
    updatedBy: userId,
    lastPassword: currentPassword,
    lastPasswordUpdated: user.lastPasswordUpdated || updatedDate,
  };

  await db.UpdatedPassword.create(passwordInsert);

  // Update user password
  await db.User.findByIdAndUpdate(userId, {
    encryptedPassword,
    lastPasswordUpdated: updatedDate,
  });

  return {
    success: true,
    code: 200,
    message: constants.messages.PASSWORD_CHANGED,
    key: "PASSWORD_CHANGED",
  };
}

async function detailByUsernameService(username) {
  const query = {
    username1: username,
    roles: "U",
    isDeleted: false,
  };

  return await User.findOne(query);
}
async function updateUserProfileService(userId, data, userRole) {
  try {
    // If user is not super admin, remove username and email from update
    if (userRole !== "SA") {
      delete data.username;
      delete data.email;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
    });

    if (!updatedUser) {
      throw {
        code: 400,
        message: constantObj.user.USER_UPDATION_ISSUE,
      };
    }

    return {
      success: true,
      code: 200,
      data: {
        user: updatedUser,
        message: constantObj.user.USER_UPDATED,
      },
    };
  } catch (err) {
    throw err;
  }
}
async function resetPasswordService(
  userId,
  newPassword,
  confirmPassword,
  type,
) {
  if (newPassword !== confirmPassword) {
    throw {
      code: 400,
      message: "New password and confirm password do not match",
      key: "WRONG_PASSWORD",
    };
  }

  const user = await db.User.findById(userId);
  if (!user || user.isDeleted) {
    throw {
      code: 404,
      message: "User not found",
    };
  }

  // Hash the new password
  const encryptedPassword = bcrypt.hashSync(
    newPassword,
    bcrypt.genSaltSync(10),
  );
  const updatedDate = new Date();

  // Save in UpdatedPassword collection
  const passwordInsert = {
    updatedPassword: newPassword,
    user: userId,
  };

  await db.UpdatedPassword.create(passwordInsert);

  // Update User password
  const updatedUser = await db.User.findByIdAndUpdate(
    userId,
    { encryptedPassword, lastPasswordUpdated: updatedDate },
    { new: true },
  );

  // Optional: send email if user is a dispensary
  if (type === "dispensary") {
    await emailChangePassword(newPassword, updatedUser);
  }

  return {
    success: true,
    code: 200,
    message: constantObj.messages.PASSWORD_CHANGED,
    key: "PASSWORD_CHANGED",
  };
}

async function setPassword(data) {
  const { id, newPassword, confirmPassword, type } = data;

  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    return {
      success: false,
      error: {
        code: 404,
        message: "New password and confirm password do not match",
        key: "WRONG_PASSWORD",
      },
    };
  }

  // Find the user
  const user = await db.User.findOne({ id, isDeleted: false });
  if (!user) {
    return {
      success: false,
      error: {
        code: 404,
        message: "User not found",
        key: "USER_NOT_FOUND",
      },
    };
  }

  // Encrypt password
  const encryptedPassword = bcrypt.hashSync(
    newPassword,
    bcrypt.genSaltSync(10),
  );

  // Save updated password record
  const passwordInsert = {
    updatedPassword: newPassword,
    user: id,
  };
  if (user.lastPasswordUpdated) {
    passwordInsert.lastPasswordUpdated = user.lastPasswordUpdated;
  }
  await db.User.create(passwordInsert);

  // Update user record
  const updatedDate = new Date();
  await db.User.update(
    { id },
    { encryptedPassword, lastPasswordUpdated: updatedDate },
  );

  // Send email if dispensary
  if (type === "dispensary") {
    await emailChangePassword(newPassword, {
      email: user.email,
      username: user.username1,
    });
  }

  return {
    success: true,
    code: 200,
    message: constantObj.messages.PASSWORD_CHANGED,
    Key: "PASSWORD_CHANGED",
  };
}
async function setPassword(data) {
  const { id, newPassword, confirmPassword, type } = data;

  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    return {
      success: false,
      error: {
        code: 404,
        message: "New password and confirm password do not match",
        key: "WRONG_PASSWORD",
      },
    };
  }

  // Find the user
  const user = await db.User.findOne({ id, isDeleted: false });
  if (!user) {
    return {
      success: false,
      error: {
        code: 404,
        message: "User not found",
        key: "USER_NOT_FOUND",
      },
    };
  }

  // Encrypt password
  const encryptedPassword = bcrypt.hashSync(
    newPassword,
    bcrypt.genSaltSync(10),
  );

  // Save updated password record
  const passwordInsert = {
    updatedPassword: newPassword,
    user: id,
  };
  if (user.lastPasswordUpdated) {
    passwordInsert.lastPasswordUpdated = user.lastPasswordUpdated;
  }
  await UpdatedPassword.create(passwordInsert);

  // Update user record
  const updatedDate = new Date();
  await db.User.update(
    { id },
    { encryptedPassword, lastPasswordUpdated: updatedDate },
  );

  // Send email if dispensary
  if (type === "dispensary") {
    await emailChangePassword(newPassword, {
      email: user.email,
      username: user.username1,
    });
  }

  return {
    success: true,
    code: 200,
    message: constantObj.messages.PASSWORD_CHANGED,
    Key: "PASSWORD_CHANGED",
  };
}
async function deleteUserAccount(id) {
  const user = await db.User.findByIdAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );
  if (!user) {
    throw new Error("User not found or already deleted.");
  }

  return true;
}

async function verifyUserByEmail(emailOrUsername) {
  try {
    // Find user by email or username
    const user = await db.User.findOne({
      $and: [
        {
          $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
        { isDeleted: false },
      ],
    });

    if (!user) {
      return { success: false, error: { code: 404, message: "Invalid User" } };
    }

    const code = Number(user.code); // numeric code for frontend

    let actionTaken = null;

    // Four explicit cases
    if (user.isVerified === "N" && user.userVerified === true) {
      user.isVerified = "Y";
      user.date_verified = new Date();
      user.status = "active";
      await user.save();
      actionTaken = "verified_userVerifiedTrue";
    } else if (user.isVerified === "N" && user.userVerified === false) {
      user.isVerified = "Y";
      user.date_verified = new Date();
      user.status = "active";
      await user.save();
      actionTaken = "verified_userVerifiedFalse";
    } else if (user.isVerified === "Y" && user.userVerified === true) {
      actionTaken = "alreadyVerified_userVerifiedTrue";
    } else if (user.isVerified === "Y" && user.userVerified === false) {
      actionTaken = "alreadyVerified_userVerifiedFalse";
    }

    return { success: true, user, code, actionTaken };
  } catch (err) {
    console.error("User verification service error:", err);
    return { success: false, error: { code: 500, message: err.message } };
  }
}

async function getUserById(userId) {
  try {
    const user = await db.User.findById(userId).lean();
    console.log(user);

    if (!user) return null;

    // Add default shipping address if exists
    if (user.shippingDetail && user.shippingDetail.length > 0) {
      const defaultAddress = user.shippingDetail.find((addr) => addr.isDefault);
      if (defaultAddress) {
        user.address = defaultAddress.address1;
        user.city = defaultAddress.city;
        user.pincode = defaultAddress.pincode;
      }
    }

    return user;
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    throw err;
  }
}

async function getDashboardData() {
  try {
    // Aggregate users by year and roles
    const result = await db.User.aggregate([
      {
        $project: {
          roles: 1,
          year: { $substr: ["$createdAt", 0, 4] },
        },
      },
      {
        $group: {
          _id: { roles: "$roles", year: "$year" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          total: { $sum: "$count" },
          roles: {
            $push: {
              role: "$_id.roles",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return { success: true, data: result };
  } catch (error) {
    console.error("Dashboard aggregation error:", error);
    return { success: false, error: error.message };
  }
}

async function updateFCMData(req, res) {
  try {
    const { id, push_token } = req.body;

    if (!id || !push_token) {
      return res.status(400).json({
        success: false,
        message: "User ID and push token are required",
      });
    }

    const user = await db.User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Remove duplicate token if exists
    user.push_token_array = user.push_token_array.filter(
      (token) => token !== push_token,
    );

    // Add new token to the array
    user.push_token_array.push(push_token);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Device token updated successfully",
      data: user.push_token_array,
    });
  } catch (err) {
    console.error("updateFCMData error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function adminSideRegistration(data) {
  try {
    const date = new Date();
    data.username1 = data.username1.toLowerCase();
    data.username = data.username.toLowerCase();
    data.email = data.username.toLowerCase();

    if (!data.username1) {
      return {
        success: false,
        error: {
          code: 404,
          message: constants.messages.USERNAME_REQUIRED,
          key: "USERNAME_REQUIRED",
        },
      };
    }

    let query = {};
    if (data.roles === "U") {
      query.$or = [{ username1: data.username1 }, { username: data.username }];
    } else {
      query.username1 = data.username1;
    }

    const existingUser = await db.User.findOne(query);
    if (existingUser) {
      if (
        existingUser.username1 === data.username1 &&
        existingUser.username !== data.username
      ) {
        return {
          success: false,
          error: {
            code: 301,
            message: constants.messages.USER_EXIST,
            key: "USER_EXIST",
          },
        };
      } else if (
        existingUser.username === data.username &&
        existingUser.username1 !== data.username1
      ) {
        return {
          success: false,
          error: {
            code: 301,
            message: constants.messages.EMAIL_EXIST,
            key: "EMAIL_EXIST",
          },
        };
      } else {
        return {
          success: false,
          error: {
            code: 301,
            message: constants.messages.USERNAME_EMAIL_EXIST,
            key: "USERNAME_EMAIL_EXIST",
          },
        };
      }
    }

    data.roles = data.roles;
    data.Type = data.roles;
    data.password = data.password || 42434445;
    data.date_registered = date;
    data.date_verified = date;
    data.isVerified = "Y";
    //data.addedBy = "1";
    data.status = "active";
    data.mobile = data.mobile;

    const code = Math.floor(100000 + Math.random() * 900000); // simple unique code
    data.code = code;

    const user = await db.User.create(data);

    const token = await TokenService.generateToken({
      user_id: user.id,
      client_id: TokenService.generateTokenString(),
    });

    // Send verification email
    await userEmailVerifyLink({
      username1: user.username1,
      email: user.email,
      verifyURL: `${process.env.Puffski_BACK_WEB_URL}verify/${user.email}`,
      password: data.password,
    });

    return { success: true, code: 200, data: { user, token } };
  } catch (err) {
    console.error("Admin registration error:", err);
    return { success: false, error: { code: 500, message: err.message } };
  }
}

async function setPasswordForStores(data) {
  const { newPassword, confirmPassword, updatedBy, otp } = data;

  if (!otp) {
    return {
      success: false,
      error: { code: 400, message: "OTP is required" },
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: {
        code: 400,
        message: "New password and confirm password do not match",
        key: "WRONG_PASSWORD",
      },
    };
  }

  // Find user by OTP
  const user = await db.User.findOne({ otp, isDeleted: false });

  if (!user) {
    return {
      success: false,
      error: { code: 404, message: "Invalid OTP" },
    };
  }

  const encryptedPassword = await bcrypt.hashSync(
    newPassword,
    bcrypt.genSaltSync(10),
  );

  const passwordLog = {
    updatedPassword: newPassword,
    user: user._id,
    otp: otp,
  };

  if (updatedBy) {
    passwordLog.updatedBy = updatedBy;
  }

  await db.UpdatedPassword.create(passwordLog);

  // Update user password
  const updatedDate = new Date();

  await db.User.updateOne(
    { _id: user._id },
    {
      password: encryptedPassword,
      lastPasswordUpdated: updatedDate,
    },
  );

  await emailChangePassword(newPassword, user, function () {});

  return {
    success: true,
    code: 200,
    message: constants.messages.PASSWORD_CHANGED,
    key: "PASSWORD_CHANGED",
  };
}

const isValidEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

async function lsrRegisterUserService(data, context) {
  try {
    // 1. Validate email
    if (!isValidEmail(data.email)) {
      return {
        success: false,
        error: { code: 404, message: `Invalid email address ${data.email}` },
      };
    }

    const now = new Date();

    // 2. Normalize usernames and email
    data.username1 = (
      data.username1 ||
      data.username ||
      data.email
    ).toLowerCase();
    data.username = (data.username || data.email).toLowerCase();
    data.email = data.email.toLowerCase();

    if (data.roles === "U") {
      data.username1 = data.username1.replace(/\s/g, "");
      data.username = data.username.replace(/\s/g, "");
      data.email = data.email.replace(/\s/g, "");
    }

    // 3. Required fields check
    if (!data.username)
      return {
        success: false,
        error: {
          code: 404,
          message: "Username required",
          key: "USERNAME_REQUIRED",
        },
      };
    if (!data.Type)
      return {
        success: false,
        error: { code: 404, message: "Type required", key: "TYPE" },
      };
    if (!data.password)
      return {
        success: false,
        error: {
          code: 404,
          message: "Password required",
          key: "PASSWORD_REQUIRED",
        },
      };

    // 4. Generate unique code
    const code = commonService.getUniqueCode();
    data.code = code;

    // 5. Check if email exists
    const existingUserByEmail = await db.User.findOne({
      email: data.email,
      roles: data.roles,
      isDeleted: false,
    });
    if (existingUserByEmail) {
      return {
        success: false,
        error: {
          code: 301,
          message: "Email already exists",
          key: "EMAIL_EXIST",
          emailExist: true,
        },
      };
    }

    // 6. Check if username exists
    const existingUserByUsername = await db.User.findOne({
      username1: data.username1,
    });
    if (existingUserByUsername) {
      return {
        success: false,
        error: {
          code: 301,
          message: "Username already exists",
          key: "USER_EXIST",
        },
      };
    }

    // 7. Prepare new user
    data.date_registered = now;
    data.date_verified = now;
    data.userType = "LSR";
    data.status = "active";
    if (data.userVerified) data.isVerified = "Y";

    const newUser = await db.User.create(data);
    context.id = newUser.username;
    context.type = "Email";

    // 8. ActiveCampaign subscription for normal user
    if (data.roles === "U") {
      try {
        await ActiveCampaign.subscribeUser({
          email: data.email,
          first_name: data.username1,
          last_name: data.username1,
          listIds: [1],
        });
      } catch (error) {
        if (error.name === "EmailAlreadyUsed") {
          return {
            success: false,
            error: {
              code: 301,
              message: "User already exists",
              key: "USER_EXIST",
            },
          };
        }
        return {
          success: false,
          error: { code: 301, message: "ActiveCampaign API error" },
        };
      }
    }

    // 9. Generate token
    const token = await TokenService.generateToken({
      user_id: newUser._id,
      client_id: TokenService.generateTokenString(),
    });

    // 10. For STOREADMIN, create item (dispensary)
    if (data.userType === "LSR" && data.roles === "STOREADMIN") {
      let slug = data.businessName.toLowerCase().replace(/\s+/g, "-");
      const existingItem = await db.Item.findOne({ slug, isDeleted: false });
      if (existingItem)
        slug += "-" + Math.floor(Math.random() * (999 - 100 + 1) + 100);

      const itemData = {
        username: data.email.toLowerCase(),
        businessType: "showroom seller",
        name: data.contactName,
        city: data.city,
        allCity: [data.city],
        email: data.email,
        mobile: data.phoneNumber,
        isFeatured: false,
        isFeaturedDelivery: false,
        scheduler: [
          {
            day: "Monday",
            startTime: "9:00",
            closeTime: "21:00",
            is24hours: false,
          },
          {
            day: "Tuesday",
            startTime: "9:00",
            closeTime: "21:00",
            is24hours: false,
          },
          {
            day: "Wednesday",
            startTime: "9:00",
            closeTime: "21:00",
            is24hours: false,
          },
          {
            day: "Thursday",
            startTime: "9:00",
            closeTime: "21:00",
            is24hours: false,
          },
          {
            day: "Friday",
            startTime: "9:00",
            closeTime: "21:00",
            is24hours: false,
          },
          {
            day: "Saturday",
            startTime: "9:00",
            closeTime: "21:00",
            is24hours: false,
          },
          {
            day: "Sunday",
            startTime: "9:00",
            closeTime: "21:00",
            is24hours: false,
          },
        ],
        deliverySchedule: [
          { day: "Monday", startTime: "9:00", closeTime: "21:00" },
          { day: "Tuesday", startTime: "9:00", closeTime: "21:00" },
          { day: "Wednesday", startTime: "9:00", closeTime: "21:00" },
          { day: "Thursday", startTime: "9:00", closeTime: "21:00" },
          { day: "Friday", startTime: "9:00", closeTime: "21:00" },
          { day: "Saturday", startTime: "9:00", closeTime: "21:00" },
          { day: "Sunday", startTime: "9:00", closeTime: "21:00" },
        ],
        addedBy: token.user_id,
        slug,
      };

      await db.Item.create(itemData);

      // Send verification email
      return await lsrEmailVerifyLink({
        id: context.id,
        type: context.type,
        username: data.email,
        password: data.password,
        username1: data.username1,
        userVerified: data.userVerified,
        code,
        roles: "STOREADMIN",
        firstName: data.contactName,
        city: data.city,
        verifyURL: `${
          process.env.Puffski_BACK_WEB_URL || process.env.Puffski_BACK_WEB_URL
        }lsr/verify/${data.email}`,
      });
    }

    // 11. For normal user
    return await lsrEmailVerifyLink({
      id: context.id,
      type: context.type,
      username: data.email,
      username1: data.username1,
      password: data.password,
      userVerified: data.userVerified,
      code,
      roles: "U",
      firstName: data.fullName,
      city: data.city,
      verifyURL: `${
        process.env.Puffski_BACK_WEB_URL || process.env.Puffski_BACK_WEB_URL
      }lsr/verify/${data.email}`,
    });
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: { code: 500, message: "Server error", details: error.message },
    };
  }
}

async function getAllUsersService(filters) {
  const {
    search,
    sortBy = "createdAt desc",
    page = 1,
    count = 10,
    status,
    roles,
    userroles,
    isBomFestUser,
    store,
    type,
    city,
    userType,
    userby,
    isSellerApproved,
  } = filters;

  const skipNo = (Number(page) - 1) * Number(count);

  // Base query
  const query = { isDeleted: false };
  if (status) query.status = status;
  if (roles) query.roles = roles;
  if (type) query.Type = type;
  if (userType) query.userType = userType;
  if (store) query.store_slug = store;
  if (isBomFestUser !== undefined)
    query.isBomFestUser = isBomFestUser === "true";
  if (userroles) query.roles = userroles;
  if (city) query.city = new RegExp(city, "i");
  if (isSellerApproved === "true") query.isSellerApproved = true;
  if (isSellerApproved === "false") query.isSellerApproved = false;

  // Search
  if (search) {
    const searchRegex = new RegExp(search, "i");
    if (isNaN(search)) {
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { username1: searchRegex },
        { address: searchRegex },
      ];
    } else {
      query.$or = [{ mobile: new RegExp(search) }];
    }
  }

  // Sorting
  let [field, direction] = sortBy.split(" ");
  field = field === "email" ? "username1" : field;
  const sortQuery = {};
  sortQuery[field || "createdAt"] = direction === "desc" ? -1 : 1;

  // Count total results
  const totalResults = await db.User.countDocuments(query);

  // Aggregate query
  const results = await db.User.aggregate([
    { $match: query },
    { $sort: sortQuery },
    {
      $lookup: {
        from: "UserLogin",
        localField: "_id",
        foreignField: "User",
        as: "userslogin",
      },
    },
    {
      $project: {
        id: "$_id",
        Type: "$Type",
        ageVerifiedAt: "$ageVerifiedAt",
        ageVerifiedBy: "$ageVerifiedBy",
        commonCourier: "$commonCourier",
        createdAt: "$createdAt",
        date_registered: "$date_registered",
        date_verified: "$date_verified",
        domain: "$domain",
        email: "$email",
        firstName: "$firstName",
        fullName: "$fullName",
        isDeleted: "$isDeleted",
        isMaster: "$isMaster",
        isVerified: "$isVerified",
        lastLogin: "$lastLogin",
        lastName: "$lastName",
        city: "$city",
        type: "$type",
        userType: "$userType",
        address: "$address",
        store_slug: "$store_slug",
        isBomFestUser: "$isBomFestUser",
        lat: "$lat",
        lng: "$lng",
        mobile: "$mobile",
        rewardPoint: "$rewardPoint",
        roles: "$roles",
        status: "$status",
        updatedAt: "$updatedAt",
        userVerified: "$userVerified",
        username: { $toLower: "$username" },
        username1: { $toLower: "$username1" },
        isSellerApproved: "$isSellerApproved",
        usersloginCount: { $size: "$userslogin" },
      },
    },
    { $skip: skipNo },
    { $limit: Number(count) },
  ]);

  let finalResults = results.map((u) => ({ ...u, isFavourite: false }));
  if (userby) {
    const whislists = await db.wishList.find({
      type: "store",
      addedBy: userby,
    });
    const favIds = whislists.map((w) => w.storeId.toString());
    finalResults = finalResults.map((u) => ({
      ...u,
      isFavourite: favIds.includes(u.id.toString()),
    }));
  }

  return { users: finalResults, total: totalResults };
}

async function getAllUsersnewService(queryParams) {
  const {
    search,
    sortBy,
    page = 1,
    count = 10,
    status,
    roles,
    userroles,
  } = queryParams;

  const skipNo = (Number(page) - 1) * Number(count);

  const query = {};

  // Filter by status
  if (status) query.status = status;

  // Filter by roles
  if (roles) query.roles = roles;
  if (userroles) query.roles = userroles;

  // Search
  if (search) {
    if (isNaN(search)) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username1: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    } else {
      query.$or = [{ mobile: { $regex: parseInt(search), $options: "i" } }];
    }
  }

  // Sorting
  let sortQuery = {};
  if (sortBy) {
    const [field, type] = sortBy.split(" ");
    sortQuery[field || "createdAt"] = type === "desc" ? -1 : 1;
  } else {
    sortQuery["createdAt"] = -1;
  }

  // Aggregation pipeline
  const pipeline = [
    { $match: query },

    // Lookup userslogin
    {
      $lookup: {
        from: "UserLogin",
        localField: "_id",
        foreignField: "User",
        as: "userslogin",
      },
    },

    // Lookup wishlist
    {
      $lookup: {
        from: "Wishlist",
        localField: "_id",
        foreignField: "User",
        as: "wishlist",
      },
    },

    // Lookup reserveorders
    {
      $lookup: {
        from: "ReserveOrder",
        localField: "_id",
        foreignField: "addedBy",
        as: "orders",
      },
    },

    // Compute totalSpend
    {
      $addFields: {
        usersloginCount: { $size: "$userslogin" },
        wishlistCount: { $size: "$wishlist" },
        totalSpend: { $sum: "$orders.totalprice" },
      },
    },

    // Sorting, pagination
    { $sort: sortQuery },
    { $skip: skipNo },
    { $limit: Number(count) },

    // Project final fields
    {
      $project: {
        id: "$_id",
        fullName: 1,
        email: 1,
        username: 1,
        username1: 1,
        mobile: 1,
        roles: 1,
        status: 1,
        lastLogin: 1,
        isVerified: 1,
        createdAt: 1,
        updatedAt: 1,
        usersloginCount: 1,
        wishlistCount: 1,
        totalSpend: 1,
      },
    },
  ];

  const users = await db.User.aggregate(pipeline);

  const total = await db.User.countDocuments(query);

  return { users, total };
}

async function getAllUsersUpdate(params) {
  const {
    search,
    sortBy,
    page = 1,
    count = 10,
    status,
    roles,
    userroles,
  } = params;
  const skipNo = (Number(page) - 1) * Number(count);

  const query = {};
  const queryCount = {};

  // Status and roles
  if (status) {
    query.status = status;
    queryCount.status = status;
  }
  if (roles) {
    query.roles = roles;
    queryCount.roles = roles;
  }
  if (userroles) {
    query.roles = userroles;
    queryCount.roles = userroles;
  }

  // Search filter
  if (search) {
    const regex = new RegExp(search, "i");
    if (isNaN(search)) {
      query.$or = [
        { fullName: regex },
        { email: regex },
        { username1: regex },
        { address: regex },
      ];
      queryCount.$or = query.$or;
    } else {
      query.$or = [{ mobile: regex }];
      queryCount.$or = query.$or;
    }
  }

  // Sorting
  let sortField = "createdAt";
  let sortOrder = -1;
  if (sortBy) {
    const [field, order] = sortBy.split(" ");
    sortField = field === "email" ? "username1" : field;
    sortOrder = order === "desc" ? -1 : 1;
  }
  const sortQuery = { [sortField]: sortOrder };

  // Count total users
  const totalresults = await db.User.countDocuments(queryCount);

  // Fetch users
  const users = await db.User.aggregate([
    { $match: query },
    { $sort: sortQuery },
    { $skip: skipNo },
    { $limit: Number(count) },
    {
      $lookup: {
        from: "UserLogin",
        localField: "_id",
        foreignField: "user",
        as: "userslogin",
      },
    },
    {
      $project: {
        id: "$_id",
        Type: "$Type",
        ageVerifiedAt: "$ageVerifiedAt",
        ageVerifiedBy: "$ageVerifiedBy",
        commonCourier: "$commonCourier",
        createdAt: "$createdAt",
        date_registered: "$date_registered",
        date_verified: "$date_verified",
        domain: "$domain",
        email: "$username",
        firstName: "$firstName",
        fullName: "$fullName",
        isDeleted: "$isDeleted",
        isMaster: "$isMaster",
        isVerified: "$isVerified",
        lastLogin: "$lastLogin",
        lastName: "$lastName",
        store_slug: "$store_slug",
        isBomFestUser: "$isBomFestUser",
        lat: "$lat",
        lng: "$lng",
        mobile: "$mobile",
        reviewStatus: "$reviewStatus",
        rewardPoint: "$rewardPoint",
        roles: "$roles",
        status: "$status",
        updatedAt: "$updatedAt",
        userVerified: "$userVerified",
        username: { $toLower: "$username" },
        username1: { $toLower: "$username1" },
        usersloginCount: { $size: "$userslogin" },
      },
    },
  ]);

  // Calculate totalOrder, totalSpend, avgSpend per user
  for (const user of users) {
    const orders = await db.ReserveOrder.find({ addedBy: user.id });
    const totalOrder = orders.length;
    const totalSpend = orders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const avgspend = totalOrder > 0 ? (totalSpend / totalOrder).toFixed(2) : 0;

    user.totalOrder = totalOrder;
    user.totalSpend = totalSpend;
    user.avgspend = avgspend;

    // Update user document
    await db.User.updateOne(
      { _id: user.id },
      { totalOrder, totalSpend, avgspend },
    );
  }

  return { users, total: totalresults };
}

async function otpVerifyService(req, res) {
  const result = await db.User.findOne({ otp: req.body.otp, isDeleted: false });
  if (!result) {
    throw new Error(constants.messages.OTP_ERR);
  }

  return true;
}

async function verifyUserAccount(id, data, identity) {
  const user = await db.User.findOne({ _id: id });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedData = {
    userVerified: true,
    ageVerifiedBy: identity.id,
    ageVerifiedAt: new Date(),
  };

  if (data.firstName) updatedData.firstName = data.firstName;
  if (data.lastName) updatedData.lastName = data.lastName;
  if (data.firstName && data.lastName) {
    updatedData.fullName = `${data.firstName} ${data.lastName}`;
  }

  await db.User.updateOne({ _id: id }, updatedData);

  return true;
}

async function otpSendService(email) {
  const user = await db.User.findOne({ email, isDeleted: false });

  if (!user) {
    return {
      success: false,
      error: {
        code: 404,
        message: "Invalid user",
        key: "INVALID_USER",
      },
    };
  }

  const otp = generateOTP();

  await db.User.updateOne({ _id: user._id }, { otp });

  // SMS message
  const smsMessage = `New OTP for password change is ${otp}`;

  try {
    // First SMS
    await client.messages.create({
      body: smsMessage,
      to: process.env.SSNO,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    // Second SMS to CARL
    await client.messages.create({
      body: smsMessage,
      to: process.env.CARL_NUMBER,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
  } catch (err) {
    console.error("Twilio SMS Error:", err);
  }

  // Slack notification
  try {
    await slack.chat.postMessage({
      channel: channelId,
      text: `*OTP Requested*\nOTP: ${otp}\nEmail: ${email}\nTime: ${new Date()}`,
    });
  } catch (err) {
    console.error("Slack Error:", err);
  }

  // Email Send
  const emailHtml = `
        <h3>Hello ${user.firstName || user.fullName || user.username1},</h3>
        <p>Your password reset OTP is:</p>
        <h1>${otp}</h1>
        <p>Please use this OTP to reset your password.</p>
  `;

  const response = await sendEmail(
    process.env.ADMIN_EMAIL,
    "Password Reset OTP",
    emailHtml,
  );

  if (!response.success) {
    return {
      success: false,
      data: {
        message: "Error sending email",
        key: "ERROR_MAIL",
      },
    };
  }

  return {
    success: true,
    data: {
      message: "OTP sent successfully",
    },
  };
}

const ageVerificationService = async (id, data, verifierId) => {
  // Prepare update object
  const dataToUpdate = {
    userVerified: true,
    ageVerifiedBy: verifierId,
    ageVerifiedAt: new Date(),
  };

  if (data.firstName && data.lastName) {
    dataToUpdate.fullName = data.firstName + " " + data.lastName;
  }

  if (data.firstName) {
    dataToUpdate.firstName = data.firstName;
  }

  if (data.lastName) {
    dataToUpdate.lastName = data.lastName;
  }

  // Find user
  const user = await db.User.findOne({ _id: id });
  if (!user) {
    throw new Error("User not found");
  }

  // Optional: call external API
  try {
    dataToUpdate.username1 = user.username1;
    await axios.put("https://endpoint.instaleaf.ca/approve/user", dataToUpdate);
  } catch (err) {
    console.error("External API error:", err.message);
    // Optional: decide whether to fail or continue
  }

  // Update user in DB
  const updatedUser = await db.User.findByIdAndUpdate(
    { _id: String(id) },
    dataToUpdate,
    { new: true },
  );

  return updatedUser;
};

async function lsrCommonOTPSend(email) {
  try {
    // Find user
    const user = await db.User.findOne({ email, isDeleted: false });

    if (!user) {
      return {
        success: false,
        error: {
          code: 404,
          message: constants.messages.INVALID_USER,
          key: "INVALID_USER",
        },
      };
    }

    // Generate OTP
    const otp = await generateOTP();

    // Update user with new OTP
    await db.User.updateOne({ _id: user._id }, { otp });

    // Build email template
    const html = await otpTemplate({
      firstName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.fullName || user.username1,
      otp,
    });

    // Send email via SMTP controller
    const emailResponse = await sendEmail(
      email,
      "Local Showroom Password Reset",
      html,
    );

    if (!emailResponse.success) {
      return {
        success: false,
        data: {
          message: constants.messages.ERROR_MAIL,
          key: "ERROR_MAIL",
        },
      };
    }

    return {
      success: true,
      data: {
        message: "OTP sent to email successfully",
      },
    };
  } catch (err) {
    console.error("OTP Send Error:", err);
    return {
      success: false,
      error: {
        code: 500,
        message: err.message,
      },
    };
  }
}

const allowedDevices = ["Android", "IOS", "Web"];
async function autoLoginService(data) {
  let query = {};

  if (data.code) query.code = Number(data.code);
  if (data.email) query.email = data.email;

  const user = await db.User.findOne(query);
  if (!user) {
    return {
      success: false,
      error: {
        code: 404,
        message: constants.messages.WRONG_USERNAME,
        key: "WRONG_USERNAME",
      },
    };
  }

  if (user.roles === "DRIVER") {
    return {
      success: false,
      error: { code: 201, message: constants.messages.DRIVER_LOGIN },
    };
  }

  if (user.roles === "U" && user.isVerified !== "Y") {
    return {
      success: false,
      error: {
        code: 404,
        isVerified: false,
        email: user.email,
        message: constants.messages.USERNAME_NOT_VERIFIED,
        key: "USERNAME_NOT_VERIFIED",
      },
    };
  }

  if (user.status === "deactive") {
    return {
      success: false,
      error: {
        code: 404,
        message: constantObj.messages.USERNAME_INACTIVE,
        key: "USERNAME_INACTIVE",
      },
    };
  }

  // Prepare login data
  const device_type = allowedDevices.includes(data.device_type)
    ? data.device_type
    : "Web";
  const inputData = {
    user: user.id,
    device_type,
    gcm_id: data.gcm_id || null,
    device_token: data.device_token || null,
  };

  // Generate tokens
  const token = await TokenService.generateToken({
    client_id: user.id,
    user_id: user.id,
  });
  console.log(token);

  inputData.access_token = token.token;

  // Save login session
  await db.UserLogin.create(inputData);

  // Update user's last login info
  await db.User.updateOne(
    { id: user.id },
    {
      lastLogin: new Date(),
      status: "active",
      usersloginCount: (user.usersloginCount || 0) + 1,
      device_type,
      deviceToken: data.device_token || null,
      domain: data.domain || null,
    },
  );

  // Attach tokens to user object
  user.access_token = token.token;
  user.refresh_token = token.refresh_token;
  console.log(inputData);

  return {
    success: true,
    code: 200,
    message: constants.messages.AUTOLOGIN_SUCCESSFULLY_LOGGEDIN,
    data: inputData,
  };
}

async function commonsendOTPService(email) {
  try {
    // Find user
    const user = await db.User.findOne({ email, isDeleted: false });
    if (!user) {
      return {
        success: false,
        error: {
          code: 404,
          message: "Invalid user",
          key: "INVALID_USER",
        },
      };
    }

    // Generate OTP and update user
    const otp = generateOTP();
    await db.User.findByIdAndUpdate({ _id: user._id }, { otp });

    // Prepare email
    const firstName = user.firstName
      ? `${user.firstName} ${user.lastName}`
      : user.fullName
        ? user.fullName
        : user.username1;
    const emailHtml = `<p>Hello ${firstName},</p><p>Your OTP is: <b>${otp}</b></p>`;

    // Send email
    const emailResult = await sendEmail(
      email,
      "Your OTP Verification",
      emailHtml,
    );
    if (!emailResult.success) console.error("Email failed:", emailResult.error);

    // Send SMS via Twilio
    const smsMessage = `Your OTP is ${otp}`;
    const phoneNumbers = ["+918053649814"];

    for (const number of phoneNumbers) {
      try {
        await client.messages.create({
          body: smsMessage,
          to: number,
          from: process.env.TWILIO_PHONE_NUMBER,
        });
      } catch (smsErr) {
        console.error(`SMS failed to ${number}:`, smsErr);
      }
    }

    // // Post message to Slack
    // try {
    //   await slack.chat.postMessage({
    //     channel: process.env.SLACK_CHANNEL_ID,
    //     text: `OTP ${otp} requested for email: ${email} at ${new Date()}`,
    //   });
    // } catch (slackErr) {
    //   console.error('Slack post failed:', slackErr);
    // }

    return {
      success: true,
      data: { message: "OTP sent successfully via email and SMS" },
    };
  } catch (err) {
    console.error("sendOTP error:", err);
    return {
      success: false,
      error: {
        code: 500,
        message: "Internal server error",
        details: err.message,
      },
    };
  }
}

const signinService = async (data) => {
  let query = {
    isDeleted: false,
    $or: [{ username1: data.username }, { username: data.username }],
  };

  if (data.roles) {
    query.roles = data.roles;
  }

  const user = await db.User.findOne(query);
  console.log(user,"gjjjkxyjjxjuyujuruurtttytyytyt");
  if (!user) {
    return {
      success: false,
      error: {
        code: 404,
        message: constants.messages.WRONG_USERNAME,
        key: "WRONG_USERNAME",
      },
    };
  }

  if (
    user.roles === "U" &&
    user.isVerified !== "Y" &&
    user.status === "deactive"
  ) {
    return {
      success: false,
      error: {
        code: 404,
        isVerified: false,
        email: user.email,
        message: constants.messages.USERNAME_NOT_VERIFIED,
        key: "USERNAME_NOT_VERIFIED",
      },
    };
  }

  if (user.status === "deactive") {
    return {
      success: false,
      error: {
        code: 404,
        message: constants.messages.USERNAME_INACTIVE,
        key: "USERNAME_INACTIVE",
      },
    };
  }

  if (!bcrypt.compare(data.password, user.password)) {
    return {
      success: false,
      error: {
        code: 404,
        message: constants.messages.WRONG_PASSWORD,
        key: "WRONG_PASSWORD",
      },
    };
  }

  // Prepare login data
  const device_type = data.device_type || "Web";
  const inputData = {
    user: user.id,
    device_type,
    gcm_id: data.gcm_id || null,
    device_token: data.device_token || null,
  };

  // Generate tokens
  const token = await TokenService.generateToken({
    client_id: user.id,
    user_id: user.id,
  });
  user.access_token = token.access_token;
  user.refresh_token = token.refresh_token;
  inputData.access_token = token.access_token;

  // Save login session
  await db.UserLogin.create(inputData);

  // Update user's last login info
  const lastLoginUpdate = {
    lastLogin: new Date(),
    status: "active",
    usersloginCount: (user.usersloginCount || 0) + 1,
  };

  if (data.domain === "mobile") {
    lastLoginUpdate.deviceToken = data.device_token || null;
    lastLoginUpdate.domain = data.domain;
    lastLoginUpdate.device_type = device_type;
  }

  await db.User.findByIdAndUpdate({ _id: user._id }, lastLoginUpdate, {
    new: true,
  });
console.log(token,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
  return {
    success: true,
    code: 200,
    message: constants.messages.SUCCESSFULLY_LOGGEDIN,
    data: user,
  };
};

const DEFAULT_PASSWORD = "1234567890";

async function signupSocialMedia(data) {
  const date = new Date();

  Object.assign(data, {
    roles: "U",
    Type: "U",
    date_registered: date,
    date_verified: date,
    mobile: "1234567890",
    domain: "android",
  });

  const clientId = data.client_id;
  const provider = data.provider || data.providers;

  if (!provider) {
    return {
      success: false,
      code: 400,
      message: "Provider is required",
    };
  }

  const providerConfig = {
    facebook: { key: "fbId", suffix: "_facebook" },
    google: { key: "gId", suffix: "_google" },
    apple: { key: "gId", suffix: "_apple" },
  };

  const config = providerConfig[provider];
  if (!config || !data[config.key]) {
    return {
      success: false,
      code: 400,
      message: "Invalid social login data",
    };
  }

  // 1. Find by social ID
  let user = await db.User.findOne({ [config.key]: data[config.key] });
  if (user) {
    return socialUserAccess(clientId, user);
  }

  // 2. Find by username
  user = await db.User.findOne({ username: data.username });
  if (user) {
    return socialUserAccess(clientId, user);
  }

  // 3. Create new user
  const username1 = `${data.username1}${config.suffix}`;
  const existingUser = await db.User.findOne({ username1 });

  if (existingUser) {
    return {
      success: false,
      error: {
        code: 301,
        message: constants.messages.USER_EXIST,
        key: "USER_EXIST",
      },
    };
  }

  data.username1 = username1;
  data.password = DEFAULT_PASSWORD;

  const newUser = await db.User.create(data);
  return socialUserAccess(clientId, newUser);
}

module.exports = {
  signinService,
  SignupUserService,
  getAllUsersService,
  getAllUsersnewService,
  loginUserService,
  forgotPasswordService,
  resetPasswordService,
  registerUser,
  signinUserService,
  updateUserService,
  updateUsernameService,
  getUserProfileService,
  detailByUsernameService,
  getUserInfoService,
  changePasswordService,
  updateUserProfileService,
  setPassword,
  deleteUserAccount,
  verifyUserByEmail,
  getUserById,
  getDashboardData,
  updateFCMData,
  adminSideRegistration,
  setPasswordForStores,
  lsrRegisterUserService,
  getAllUsersService,
  getAllUsersUpdate,
  otpVerifyService,
  lsrCommonOTPSend,
  otpSendService,
  commonsendOTPService,
  verifyUserAccount,
  autoLoginService,
  ageVerificationService,
  signupSocialMedia,
};
