var sql=require('./../sql');
var passport=require('passport');
var fs=require('fs');
var judge=require('./../judger/judge');
var languages=require('./../tools/languages');
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
          console.log(err);
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
            sql.getLanguages(function(err2,result) {
              if(err2) {
                console.log(err2);
                res.render('error.html');
              }
              res.render('submit', {
                id: req.params.id,
                languages: result,
                myid: req.user,
              });
            })
          }
        }
      });
    });
    app.get('')
    app.get('/problems/:id/result', function(req,res) {
      sql.problemInfo(req.params.id, function(err,result) {
        if(err) {
          res.render('error.html');
        }
        if(result.length===0) {
          res.render('problem', {
            found: 0,
            myid: req.user
          });
        } else {
          var page=1;
          if(req.query.page!==undefined) page=req.query.page;
          sql.submitHistory(req.params.id, {user_id: req.user===undefined?null:req.user.id, limit:25, offset:25*(page-1)},function(err2,result) {
            if(err2) {
              console.log(err2);
              res.render('error.html');
              return;
            }
            res.render('judge-result', {
              myid: req.user,
              lang: languages,
              id: req.params.id,
              submits: result
            })
          });
        }
      });
    });
    app.post('/problems/:id/submit',function(req,res) {
      //console.log(req.body.code.escapeSpecialChars());
      sql.addSubmit(req.user.id,req.user.username,req.params.id,req.body.lang, function(err,result) {
        if(err) {
          console.log(err);
          res.json('{success: 0}');
          return;
        }
        fs.writeFile('./../usercode/'+result, req.body.code.escapeSpecialChars(), function(err) {
          if(err) throw err;
          console.log('File write completed');
          judge(result,req.user.id,function(err2) {
            console.error(err2);
          });
        });
        res.json('{success: 1}');
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
