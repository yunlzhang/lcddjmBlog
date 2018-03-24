var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./server/routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');
var config  = require('./config/production');
var bodyParser = require('body-parser');
// var multer = require('multer');


var app = express();

// handle fallback for HTML5 history API
//api接口不rewrite
app.use(require('connect-history-api-fallback')({
  rewrites: [
    {
      from: /^\/api\/.*$/,
      to: function(context) {
        return context.parsedUrl.pathname;
      }
    }
  ]
}));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.disable('etag');
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'dist')));
// session 中间件
app.use(session({
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true,// 强制更新 session
  saveUninitialized: false,// 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}));
// // 处理表单及文件上传的中间件
// app.use(require('express-formidable')({
//   uploadDir: path.join(__dirname, 'public/img'),// 上传文件目录
//   keepExtensions: true// 保留后缀
// }));

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'app/server/logs/success.log'
    })
  ]
}));
// 路由
routes(app);
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'app/server/logs/error.log'
    })
  ]
}));

app.listen(config.port, function () {
  console.log(`${pkg.name} listening on port ${config.port}`);
});


