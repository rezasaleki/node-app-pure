const http = require('http');
const Router = require('./router');
const userController = require('./controllers/user.controller');
const loggerMiddleware = require('./middlewares/logger');
const authorizeMiddleware = require('./middlewares/authorize');
const authMiddleware = require('./middlewares/auth');

const PORT = 8080;
const app = new Router();

// middlewares
app.use(loggerMiddleware);

// routes
app.get('/users', userController.getUsers);
app.get('/profile', authorizeMiddleware('admin'), userController.getProfile);
app.get('/admin', authMiddleware, (req, res, next) => {
  // do something
});

const server = http.createServer((req, res) => {
  app.handle(req, res);
});

server.listen(PORT, () => {
  console.log(`Server Is Runnnig Address: http://localhost:${PORT} 🚀`);
});
