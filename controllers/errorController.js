const moment = require('moment')
const customErrorHandler = (err, req, res, next) => {
  const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      console.log("Error Log 💥 => ", err, err.name, err.message, err.statusCode, err.status)
      return res.status(err.statusCode).json({
        errorCode: err.code,
        errorStatus: err.status,
        errorMessage: err.message,
        errorStack: err.stack,
        errorTimestamp: moment().format('MMMM Do YYYY,h:mm:ss a')
      });
    }
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  };
  const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      if (err.isOperational) {
        console.log("Error Log 💥 => ", err, err.message, err.statusCode, err.status)
        return res.status(err.statusCode).json({
          statusCode: err.statusCode,
          status: err.status,
          message: err.message,
          code: err.code,
          timestamp: moment().format('MMMM Do YYYY,h:mm:ss a')
        });
      }
      console.log("Error Log 💥 => ", err, err.name, err.message, err.statusCode, err.status)
      return res.status(500).json({
        statusCode: 500,
        staus: err.name,
        code: err.code,
        method: err.config.method,
        path: err.request._options.path,
        documentation_url: 'https://api.example.com/errors',
        message: '💥 Something went very wrong!',
        timestamp: moment().format('MMMM Do YYYY,h:mm:ss a')
      });
    }
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
        timestamp: moment().format('MMMM Do YYYY,h:mm:ss a')
      });
    }
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.'
    });
  };
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    sendErrorProd(error, req, res);
  }
}


module.exports = customErrorHandler
