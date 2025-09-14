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

// ✅ FIXED: Use single quotes instead of backticks
app.get('/api/test', (req, res) => {
  res.json({ message: 'krishi-ayoga API is running!' });
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/treatments', require('./routes/treatments'));
app.use('/api/livestock', require('./routes/livestock'));
app.use('/api/drugs', require('./routes/drugsRouts.js'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/alerts', require('./routes/alerts.js'));
app.use('/api/farm', require('./routes/farm.js'));
app.use(/\/api\/.*/, (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    requestedUrl: req.originalUrl
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});