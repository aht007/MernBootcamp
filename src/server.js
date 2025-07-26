const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/users');
const config = require('./config');

const app = express();

// Connect to MongoDB
connectDB();

// An example middleware

// Middleware function (runs on every request)
/* app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();  // Pass control to next middleware or route
}); */

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);


app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.env} mode`);
}); 
