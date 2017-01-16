var judger=require('./judger/judge');

//judger.judgeSubmit(100000);

var express = require('express');
var passport = require('passport');
var session = require('express-session');
var logger = require('morgan');
var MySQLSessionStore = require('express-mysql-session')(session);
var app = express();
var router_main = require('./routes/main')(app);
var router_api = require('./routes/api')(app);
app.set('views',__dirname+'/views');
app.set('view engine','ejs');
app.use('/static',express.static('public'));
app.use(logger('dev'));

var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'asdfasdf',
    database: 'sessions'
};

var sessionStore = new MySQLSessionStore(options);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));
app.engine('html',require('ejs').renderFile);
var server = app.listen(3000, function() {
  console.log('Express server started on port 3000');
});
