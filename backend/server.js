const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database.js');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get(`/api/test`, (req,res) => {
  res.json({ message: 'krishi-ayoga API is running!' })
})

app.use('/api/auth',require('./routes/auth.js'));
app.use('/api/treatments', require('./routes/treatments'));
app.use('/api/livestock', require('./routes/livestock'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})