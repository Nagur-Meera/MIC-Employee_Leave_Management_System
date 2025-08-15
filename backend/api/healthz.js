// Simple health check endpoint for Vercel
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MIC ELMS API is healthy',
    timestamp: new Date().toISOString()
  });
};
