// backend/test-server.js
const express = require('express');
const app = express();

// ONLY basic route - no imports, no middleware
app.get('/test', (req, res) => {
  res.json({ message: 'Basic test working' });
});

app.listen(5000, () => {
  console.log('Test server running on port 5000');
});