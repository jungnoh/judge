var sql=require('./../sql');
module.exports = function(app)
{
     app.get('/',function(req,res){
        res.render('problem',{
          title: 'adfdfdsdf'
        });
     });
     app.get('/about',function(req,res){
        res.render('about.html');
    });
    app.get('/users/:id',function(req,res) {

    });
    app.get('/problems/:id/submit',function(req,res) {
      sql.problemInfo(req.params.id, function(err,result) {
        if(err) {
          res.render('error.html');
        }
        else {
          if(result.length!=1) {
            res.render('problem', {
              found: 0
            });
          }
          else {
            var prob=result[0];
            res.render('submit', {
              id: req.params.id
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
              found: 0
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
                  id: req.params.id
                });
              }
            });
          }
        }
      });
    });
    app.get('/auth/login',function(req,res) {
      res.render('auth/login', {
        ret: req.query.ret
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
              found: 0
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
              sample_output: JSON.parse(prob.sample_output)
            });
          }
        }
      });
    });
}
