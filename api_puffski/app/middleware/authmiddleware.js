// src/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");
const { unprotectedRoute } = require("../utils/unProtectedRoutes");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const path = req.path; // cleaner than req.url
    console.log("Requested:", req.originalUrl);

    // Check if the route is unprotected
    if (unprotectedRoute.includes(path)) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: "No token, authorization denied" },
      });
    }

    // Expected format: Bearer <token>
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: "Invalid token format" },
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

  
    req.identity = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
  console.log("user validated");
  
    next();

  } catch (err) {
    console.error("Authorization error:", err);
    return res.status(401).json({
      success: false,
      error: { code: 401, message: "Token is not valid" },
    });
  }
};

module.exports = authMiddleware;
