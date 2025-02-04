const dotenv = require("dotenv")


process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err)
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

const app = require('./app');


dotenv.config({ path: "./config.env" })
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running gracefully on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err)
  console.log(err.name, err.message, err.stack)
  server.close(() => {
    process.exit(1);
  });
});
