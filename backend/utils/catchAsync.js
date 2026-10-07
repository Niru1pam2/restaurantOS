/**
 * Wraps an async controller function with automatic error handling.
 * Eliminates repetitive try/catch blocks in every controller.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`${fn.name || "Controller"} Error:`, error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  });
};

export default catchAsync;
