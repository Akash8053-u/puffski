const jwt = require("jsonwebtoken");
const crypto = require("crypto");

module.exports = {
  generateTokenString() {
    return crypto.randomBytes(32).toString("hex");
  },

  async generateToken(payload) {
    const token = jwt.sign(
      {
        user_id: payload.user_id,
        client_id: payload.client_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { success: true, token };
  }
};
    