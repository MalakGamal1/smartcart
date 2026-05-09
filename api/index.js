const app = require('../app');
const connectDB = require('../config/db');

// Connect to DB once when the serverless function starts
connectDB();

module.exports = app;
