module.exports = function (err, req, res, next) {
  console.error(err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Error';
  return res.status(status).json({ success: false, message });
};