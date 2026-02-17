const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'requried login !' }));
    }
    if (req.user.role !== requiredRole) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: 'دسترسی غیرمجاز' }));
    }
    next();
  };
};

module.exports = authorize;
