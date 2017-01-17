var judger            = require('./judger/judge');
var express           = require('express');
var session           = require('express-session');
var flash             = require('req-flash');
var logger            = require('morgan');
var bodyParser        = require('body-parser');
var passport          = require('passport');
var localStrategy     = require('passport-local').Strategy;
var sql               = require('./sql');
var MySQLSessionStore = require('express-mysql-session')(session);
var app = express();

passport.use(new localStrategy({
        usernameField: 'id',
        passwordField: 'password',
    },
  function(username, password, done) {
    sql.userLogin_Username(username, function(err,result) {
      if(err) {
        console.error(err);
        return done(null, false, { message: 'Server Error' });
      }
      if(result==null||result.length==0) {
        return done(null, false, { message: 'User not found' });
      }
      if(result[0].password === password) {
        return done(null,result);
      }
      return done(null, false, { message: 'Password incorrect'});
    });
  }
));
passport.serializeUser(function(user, done) {
    console.log('serialize');
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    console.log('deserialize');
    done(null, user);
});
var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'asdfasdf',
    database: 'sessions'
};
app.set('views',__dirname+'/views');
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use('/static',express.static('public'));
app.use(logger('dev'));
var sessionStore = new MySQLSessionStore(options);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.engine('html',require('ejs').renderFile);

var router_main = require('./routes/main')(app);
var router_api = require('./routes/api')(app);

var server = app.listen(3000, function() {
  console.log('Express server started on port 3000');
});
