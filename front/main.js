var judger            = require('./judger/judge');
var express           = require('express');
var session           = require('express-session');
var logger            = require('morgan');
var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var passport          = require('passport');
var localStrategy     = require('passport-local').Strategy;
var sql               = require('./sql');
var MySQLSessionStore = require('express-mysql-session')(session);
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
app.set('views',__dirname+'/views');
app.set('view engine','ejs');
app.use('/static',express.static('public'));
app.use(logger('dev'));
//app.use(cookieParser(cookieKey));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(session({ secret: cookieKey, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

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
      done(null, {id: user[0].user_id, username: user[0].id,nickname: result[0].nickname});
    });
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.engine('html',require('ejs').renderFile);

var router_main = require('./routes/main')(app);
var router_api = require('./routes/api')(app);

var server = app.listen(3000, function() {
  console.log('Express server started on port 3000');
  sql.addSubmit();
  //sql.signupUser({id:'admin' , email:'a@a.com' , organization:'' , password:'pwpw' , nickname:'admin' , comment:'hi' }, function(err) {console.log(err)});
});
