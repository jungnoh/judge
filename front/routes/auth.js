var sql=require('./../sql');
var passport=require('passport');
var fs=require('fs');
var judge=require('./../judger/judge');
var languages=require('./../tools/languages');
module.exports = function(app)
{
  app.get('/auth/logout', function (req, res){
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });
  app.get('/auth/login',function(req,res) {
    res.render('auth/login', {
      ret: req.query.ret,
      myid: req.user
    });
  });
  app.post('/auth/login', function(req,res,next) {
    passport.authenticate('local',
    { failureFlash: true, passReqToCallback : true },
    function(err, user, info) {
      if(err) {
        return res.json({'success': 0,'message': err.message});
      }
      if(!user) {
        return res.json({'success': 0,'message': info.message});
      }
      req.login(user, function (err) {
        if(err) {
          console.log(err);
          return res.json({'success': 0,'message': err.message});
          return;
        }
        return res.json({'success': 1});
      });
    })(req,res,next);
  });
  app.get('/auth/signup',function(req,res) {
    res.render('auth/signup', {
      ret: req.query.ret,
      myid: req.user
    });
  });
  app.post('/auth/signup',function(req,res) {
    console.log(req.body);
    if(req.body.hasOwnProperty('id')&&req.body.hasOwnProperty('pw')&&req.body.hasOwnProperty('email')&&req.body.hasOwnProperty('nickname')&&req.body.hasOwnProperty('org')) {
      sql.userExists(req.body.id,req.body.email,function(err,result) {
        if(err) {
          console.log(err);
          return res.json({'success': 0,'message': err.message});
          return;
        }
        else if(result) {
          return res.json({'success': 0,'message': 'User already exists.'});
          return;
        }
        else {
          var options = {'id': req.body.id, 'email': req.body.email, 'organization': req.body.org, 'pw': req.body.pw, 'nickname': req.body.nickname};
          sql.signupUser(options, function(err2) {
            if(err2) {
              console.log(err2);
              return res.json({'success': 0,'message': err2.message});
              return;
            }
            else {
              return res.json({'success': 1});
              return;
            }
          });
        }
      });
    }
    else {
      return res.json({'success': 0,'message': 'Invalid request.'});
      return;
    }
  });
};
