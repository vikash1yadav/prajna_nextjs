import app from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    global.MOCK_DB_MODE = false;
  } catch (error) {
    console.warn('------------------------------------------------------------');
    console.warn('WARNING: Database connection failed:', error.message);
    console.warn('Starting Express server in MOCK DATABASE MODE...');
    console.warn('------------------------------------------------------------');
    global.MOCK_DB_MODE = true;
  }

  // Start listening
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
