var judger            = require('./judger/judge');
var express           = require('express');
var session           = require('express-session');
var logger            = require('morgan');
var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var passport          = require('passport');
var localStrategy     = require('passport-local').Strategy;
var sql               = require('./sql');
var path              = require('path');
var languages         = require('./tools/languages');
var MySQLSessionStore = require('express-mysql-session')(session);
var i18n              = require('i18n');
var bcrypt = require('./bcrypt');
var app = express();

String.prototype.escapeSpecialChars = function() {
     return this.replace(/\\n/g, "\\n")
                .replace(/\\'/g, "\\'")
                .replace(/\\"/g, '\\"')
                .replace(/\\&/g, "\\&")
                .replace(/\\r/g, "\\r")
                .replace(/\\t/g, "\\t")
                .replace(/\\b/g, "\\b")
                .replace(/\\f/g, "\\f");
};

var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'asdfasdf',
    database: 'sessions'
};

const cookieKey='@ruby';
console.log(__dirname + '/locales');
app.set('views',path.resolve(__dirname,'views'));
app.set('view engine','ejs');
app.use('/static',express.static('public'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(i18n.init);

i18n.configure({
  locales: ['en', 'ko'],
  cookie: 'lang',
  directory: __dirname + '/locales',
  defaultLocale: 'ko',
  queryParameter: 'lang',
  logDebugFn: function (msg) {
        console.log('debug', msg);
    },

    // setting of log level WARN - default to require('debug')('i18n:warn')
    logWarnFn: function (msg) {
        console.log('warn', msg);
    },

    // setting of log level ERROR - default to require('debug')('i18n:error')
    logErrorFn: function (msg) {
        console.log('error', msg);
    }
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(session({ secret: cookieKey, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy({
        usernameField: 'id',
        passwordField: 'password'
    },
  function(username, password, done) {
    sql.userLogin_Username(username, function(err,result) {
      if(err) {
        console.error(err);
        return done(null, false, { message: 'Server Error' });
      }
      if(result===null||result.length===0) {
        return done(null, false, { message: 'User not found' });
      }
      bcrypt.comparePassword(password,result[0].password,function(err, isPasswordMatch) {
        if(err) {
          console.error(err);
          return done(null, false, { message: 'Server Error' });
        }
        if(isPasswordMatch) return done(null,result);
        else return done(null, false, { message: 'Password incorrect'});
      });
    });
  }
));
passport.serializeUser(function(user, done) {
    sql.userInfo_Username(user[0].id,function(err,result) {
      if(err) {
        console.error(err);
        return done(err,null);
      }
      done(null, {id: result[0].user_id, username: user[0].id,nickname: result[0].nickname});
    });
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.engine('html',require('ejs').renderFile);

var router_main = require('./routes/main')(app);
var router_user = require('./routes/user')(app);
var router_prob = require('./routes/problems')(app);

var server = app.listen(3000, function() {
  console.log('Express server started on port 3000');
  sql.getLanguages(function(err,result) {
    if(err) {
      console.error('Failed to get languages');
      console.error(err)
    }
    for(var i=0;i<result.length;i++) {
      languages[result[i].codename]=result[i];
    }
  });
});
