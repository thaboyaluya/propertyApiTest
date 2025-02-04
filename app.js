const propertyRouter = require('./routes/propertyRoutes')
const AppError = require('./utils/appError');
const morgan = require('morgan')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const path = require('path')
const express = require("express")
const cors = require('cors')
const hpp = require('hpp');
const customErrorHandler = require('./controllers/errorController')
const moment = require('moment')




const app = express()
app.set('trust proxy', 1)
app.get('/ip', (request, response) => response.send(request.ip))
app.get('/x-forwarded-for', (request, response) => response.send(request.headers['x-forwarded-for']))

app.use(express.json())

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// Implement CORS
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));



// Set security HTTP headers
app.use(helmet());



// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  statusCode: 429,
  validate: {
    trustProxy: false
  },
  standardHeaders: true,
  message: async (req, res) => {
    res.status(429).send({
      status: 'error',
      statusCode: 429,
      message: `Too many requests from this IP, please try again by ${moment().add(61, 'minutes').format('hh:mm A')}!`
    })
  }
});
app.use('/api', limiter);




app.use(xss());
app.use(hpp())




app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy', "default-src 'self' * ;script-src 'self' *; frame-src 'self' *;connect-src 'self' *; worker-src 'self' blob: * ; font-src 'self' *; img-src 'self' data: *;style-src 'self' data: * 'sha256-yn0Wb1XhyC3LXpxWSUo+ag71PXN9SXk3+sAmp/2pUvk='"
  )
  next()
})


// ROUTES
app.use('/api/v1', propertyRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`The  ${req.originalUrl} endpoint does not exist in our API! Please check the URL and try again.`, 404));
});


app.use(customErrorHandler)


module.exports = app