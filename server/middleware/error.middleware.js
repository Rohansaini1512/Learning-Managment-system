const errorMiddleware = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 503;
    err.message = err.message || "Something went wrong";
  
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  };
  
  export default errorMiddleware;