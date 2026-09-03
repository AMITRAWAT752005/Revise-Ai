import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

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
