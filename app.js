const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.disable('x-powered-by');

// Add routes first
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error test route (for coverage)
app.get('/error-test', (req, res, next) => {
  next(new Error('Test error'));
});

// Add 404 handler after routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Add error handler last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app, server };
