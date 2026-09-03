require('dotenv').config({ path: '../.env' }); // using .env.example for now since .env isn't created by default
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
