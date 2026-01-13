const errorMiddleware = async (err, req, res, next) => {
  console.error(err);

  if (err.error && err.error.isJoi) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: err.error.toString() }
    });
  }

  return res.status(400).json({
    success: false,
    error: { code: err.status || 500, message: err.message || "Server Error" }
  });
};

module.exports = errorMiddleware;