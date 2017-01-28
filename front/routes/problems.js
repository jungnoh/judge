var sql       = require('./../sql');
var passport  = require('passport');
var fs        = require('fs');
var judge     = require('./../judger/judge');
var languages = require('./../tools/languages');

module.exports = function(app) {
  app.post('/problems/:id/submit',function(req,res) {
    sql.addSubmit(req.user.id,req.user.username,req.params.id,req.body.lang, function(err,result) {
      if(err) {
        console.log(err);
        res.json('{success: 0}');
        return;
      }
      fs.writeFile('./../usercode/'+result, req.body.code.escapeSpecialChars(), function(err) {
        if(err) throw err;
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
            input_desc: prob.input_desc,
            output_desc: prob.output_desc,
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
  app.get('/problems/:id/submit',function(req,res) {
    sql.problemInfo(req.params.id, function(err,result) {
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
}
