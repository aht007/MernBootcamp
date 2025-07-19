const express = require('express');
const helloRoutes = require('./routes/hello');
const config = require('./config');

const app = express();

app.use('/api/hello', helloRoutes);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.env} mode`);
}); 
