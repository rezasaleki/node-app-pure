function verifyToken(token) {
  const validTokens = {
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9': {
      id: 1,
      name: 'reza',
      role: 'admin',
    },
    'another-valid-token': { id: 2, name: 'sara', role: 'user' },
  };

  if (validTokens[token]) {
    return validTokens[token];
  }
  throw new Error('Invalid Token !');
}

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // بررسی وجود هدر و فرمت صحیح (Bearer token)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'عدم ارسال توکن یا فرمت نادرست' }));
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token); // می‌تواند async باشد
    req.user = user; // ذخیره اطلاعات کاربر برای استفاده در کنترلرها
    await next(); // ادامه به middleware بعدی یا کنترلر نهایی
  } catch (error) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `احراز هویت ناموفق: ${error.message}` }));
  }
};

module.exports = authMiddleware;
