var createError = require('http-errors');
var express = require('express');
var path = require('path');
var adaro = require('adaro');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
let cmd = require('node-cmd');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.engine('dust', adaro.dust());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');

let logs_formats = [
    'combined', 'common', 'default',
    'short', 'tiny', 'dev',
];

let logs_format = process.env.LOGS_FORMAT;
if(logs_formats.indexOf(logs_format) === -1) logs_format = 'common';

app.use(logger(logs_format));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

cmd.get(__dirname + '/node_modules/node-sass/bin/node-sass --output public/stylesheets --source-map true --source-map-contents public/stylesheets', (err, res) => {
  console.log('Transpilation sass > css > css.map');
});


module.exports = app;
