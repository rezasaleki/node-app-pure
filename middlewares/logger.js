const logger = async (req, res, next) => {
  const start = Date.now();
  console.log(`${req.method} ${req.url} - start`);
  await next();
  const duration = Date.now() - start;
  console.log(`${req.method} ${req.url} - end (${duration}ms)`);
};

module.exports = logger;
