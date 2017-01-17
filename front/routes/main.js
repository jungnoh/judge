var sql=require('./../sql');
var passport=require('passport');
module.exports = function(app)
{
    app.get('/',function(req,res){
      res.render('problem',{
        found: 0,
        myid: req.user
      });
    });
    app.get('/about',function(req,res){
        res.render('about.html');
    });
    app.get('/users/:id',function(req,res) {

    });
    app.get('/problems/:id/submit',function(req,res) {
      sql.problemInfo(req.params.id, function(err,result) {
        console.log(req.session);
        console.log(req.user);
        console.log('>');
        console.log(JSON.stringify(req.user));
        if(err) {
          res.render('error.html');
        }
        else {
          if(result.length!=1) {
            res.render('problem', {
              found: 0,
              myid: req.user
            });
          }
          else {
            var prob=result[0];
            res.render('submit', {
              id: req.params.id,
              myid: req.user
            });
          }
        }
      });
    });
    app.get('/problems/:id/stats',function(req,res) {
      sql.problemInfo(req.params.id, function(err,result) {
        if(err) {
          res.render('error.html');
        }
        else {
          if(result.length!=1) {
            res.render('problem', {
              found: 0,
              myid: req.user
            });
          }
          else {
            sql.problemStats(req.params.id, function(err2,result) {
              if(err2) {
                res2.render('error.html');
              }
              else {
                var prob=result[0];
                res.render('problem-stats', {
                  stats: prob,
                  id: req.params.id,
                  myid: req.user
                });
              }
            });
          }
        }
      });
    });
    app.get('/auth/logout', function (req, res){
      req.session.destroy(function (err) {
        res.redirect('/'); //Inside a callback… bulletproof!
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
    /*
    app.post('/auth/login', passport.authenticate('local', { failueRedirect: '/auth/login', failureFlash: true, passReqToCallback : true }),
      function(req, res, next) {
        console.log('a');
        //console.log(req);
        // handle success
        req.session.save(function(err) {
          if(err) return next(err);
          return res.json({id: req.user.id});
        });
      }); */
    app.get('/problems/:id',function(req,res) {
      sql.problemInfo(req.params.id, function(err,result) {
        if(err) {
          res.render('error.html');
        }
        else {
          if(result.length!=1) {
            res.render('problem', {
              found: 0,
              myid: req.user
            });
          }
          else {
            var prob=result[0];
            res.render('problem', {
              found: 1,
              id: req.params.id,
              title: prob.title,
              submit_count: prob.submit_count,
              accept_count: prob.accept_count,
              accept_users: prob.accept_users,
              description: prob.description,
              hint: prob.hint,
              added_date: prob.added_date,
              source: prob.source,
              time_limit: prob.time_limit,
              memory_limit: prob.memory_limit,
              sample_input: JSON.parse(prob.sample_input),
              sample_output: JSON.parse(prob.sample_output),
              myid: req.user
            });
          }
        }
      });
    });
}
