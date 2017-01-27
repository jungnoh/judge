var sql       = require('./../sql');
var passport  = require('passport');
var fs        = require('fs');
var judge     = require('./../judger/judge');
var languages = require('./../tools/languages');

module.exports = function(app)
{
  //GET /auth/login
  app.get('/auth/login',function(req,res) {
    res.render('auth/login', {
      ret: req.query.ret,
      myid: req.user
    });
  });
  //POST /auth/login
  app.post('/auth/login', function(req,res,next) {
    passport.authenticate('local', { failureFlash: true, passReqToCallback : true },
    function(errAuth, user, info) {
      if(errAuth) {
        console.log(errAuth);
        return res.json({'success': 0, 'message': 'Error while logging in.'});
      }
      if(!user) {
        return res.json({'success': 0, 'message': 'Error while logging in.'});
      }
      req.login(user, function (errLogin) {
        if(errLogin) {
          console.log(errLogin);
          return res.json({'success': 0, 'message': 'Error while logging in.'});
        }
        return res.json({'success': 1});
      });
    })(req,res,next);
  });
  //GET /auth/signup
  app.get('/auth/signup',function(req,res) {
    res.render('auth/signup', {
      ret: req.query.ret,
      myid: req.user
    });
  });
  //POST /auth/signup
  app.post('/auth/signup',function(req,res) {
    console.log(req.body);
    if(req.body.hasOwnProperty('id')
    && req.body.hasOwnProperty('pw')
    && req.body.hasOwnProperty('email')
    && req.body.hasOwnProperty('nickname')
    && req.body.hasOwnProperty('org')) {
      sql.userExists(req.body.id,req.body.email,function(userExistErr,result) {
        if(userExistErr) {
          console.log(userExistErr);
          return res.json({'success': 0,'message': 'Error while signing up.'});
          return;
        }
        else if(result) {
          return res.json({'success': 0,'message': 'User already exists.'});
          return;
        }
        else {
          var options = { 'id': req.body.id,
                          'email': req.body.email,
                          'organization': req.body.org,
                          'pw': req.body.pw,
                          'nickname': req.body.nickname };
          sql.signupUser(options, function(signUpErr) {
            if(signUpErr) {
              console.log(signUpErr);
              return res.json({'success': 0,'message': err2.message});
            }
            else return res.json({'success': 1});
          });
        }
      });
    }
    else {
      return res.json({'success': 0,'message': 'Invalid request.'});
    }
  });
  //GET /auth/logout
  app.get('/auth/logout', function (req, res){
    req.session.destroy(function(err) {
      res.redirect('/');
    });
  });
};
