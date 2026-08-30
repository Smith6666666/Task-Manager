process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error.name, error.message);
  console.error(error.stack);

  process.exit(1);
});

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/config.env` });

const validateEnv = require('./utils/validateEnv');
const checkReminders = require('./utils/reminderScheduler');

try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
};

const app = require('./app');

const port = process.env.PORT || 8000;

let server;
let reminderInterval;

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log('Database is connected...');

    reminderInterval = setInterval(() => {
      checkReminders();
    }, 60000);

    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}...`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  };
};

async function shutdown(signal, exitCode = 0) {
  console.log(`${signal} received. Shutting down...`);

  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  };

  try {
    if (server) {
      server.close(async () => {
        try {
          await mongoose.connection.close();

          console.log('Server and database connection closed...');
          process.exit(exitCode);
        } catch (error) {
          console.error('Error while closing database:', error.message);
          process.exit(1);
        };
      });

      return;
    };

    await mongoose.connection.close();
    process.exit(exitCode);
  } catch (error) {
    console.error('Graceful shutdown failed:', error.message);
    process.exit(1);
  };
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM', 0);
});

process.on('SIGINT', () => {
  shutdown('SIGINT', 0);
});

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION:', error.name, error.message);
  console.error(error.stack);

  shutdown('UNHANDLED_REJECTION', 1);
});

connectDB();