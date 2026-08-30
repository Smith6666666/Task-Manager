function globalErrorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'fail',
      message: 'Profile image must be smaller than 5 MB.'
    });
  };

  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  };

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  };

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  };

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Your session has expired'
    });
  };

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      status: 'fail',
      message: `${field} already exists.`
    });
  };

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid ${err.path}.`
    });
  };

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong.'
  });
};

module.exports = globalErrorHandler;