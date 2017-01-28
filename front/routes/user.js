var sql       = require('./../sql');
var passport  = require('passport');
var fs        = require('fs');
var judge     = require('./../judger/judge');
var languages = require('./../tools/languages');
var i18n      = require('i18n');
const intMax  = 2147483647;

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
        return res.json({'success': 0, 'message': res.__('loginProcessError')});
      }
      if(!user) {
        return res.json({'success': 0, 'message': res.__('loginProcessError')});
      }
      req.login(user, function (errLogin) {
        if(errLogin) {
          console.log(errLogin);
          return res.json({'success': 0, 'message': res.__('loginProcessError')});
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
          return res.json({'success': 0,'message': res.__('signupProcessError')});
          return;
        }
        else if(result) {
          return res.json({'success': 0,'message': res.__('userAlreadyExists')});
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
      return res.json({'success': 0,'message': res.__('invalidRequest')});
    }
  });
  //GET /auth/logout
  app.get('/auth/logout', function (req, res){
    req.session.destroy(function(err) {
      res.redirect('/');
    });
  });
  //GET /user/:id
  app.get('/user/:id',function(req,res) {
    var options={},sort={};
    if(isNaN(req.params.id)) {
      res.render('error.html');
      return;
    }
    if(req.params.id<0||req.params.id>intMax) {
      res.render('error.html');
      return;
    }
    options['user_id']=req.params.id;
    sort['limit']=100; sort['offset']=0;
    sql.submitHistory(options,sort,function(err,submitHistory) {
      if(err) {
        res.render('error.html');
        return;
      }
      sql.userInfo_Userid(req.params.id,function(err2,result) {
        var times={};
        for(var i=0;i<submitHistory.length;i++) {
          var val=new Date(submitHistory[i].submit_time).getTime()/1000;
          val = Math.floor((new Date(submitHistory[i].submit_time).getTime()/1000)/3600)*3600;
          if(times.hasOwnProperty(val)) {
            times[val]=times[val]+1;
          }
          else times[val]=1;
        }
        res.render('user-info',{
          myid: req.user,
          stats: result[0],
          results: JSON.stringify(times)
        });
      });
    });
  });
};
