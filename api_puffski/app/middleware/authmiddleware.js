const jwt = require("jsonwebtoken");
const { unprotectedRoute } = require("../utils/unProtectedRoutes");

const authMiddleware = async (req, res, next) => {
  try {
    const path = req.path;
    console.log("Requested:", req.originalUrl);

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
    
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: "Invalid token format" },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    // Create identity object based on ACTUAL JWT content
    req.identity = {
      id: decoded.user_id || decoded._id || decoded.id, // Use user_id from JWT
      client_id: decoded.client_id,
      // Only include if they exist in JWT
      ...(decoded.role && { role: decoded.role }),
      ...(decoded.email && { email: decoded.email }),
      isSellerApproved: decoded.isSellerApproved || false
    };
    
    req.user = req.identity;
    req.user_id = req.identity.id; // This will now work
    
    console.log("User validated - ID:", req.identity.id);
    console.log("Full identity:", req.identity);

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