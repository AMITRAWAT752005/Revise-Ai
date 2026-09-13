import dns from "dns";
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

import './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(() => {
    process.exitCode = 1;
  });
