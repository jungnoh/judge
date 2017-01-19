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
    app.get('/result', function(req,res) {
      var page=1,options={},sort={};
      if(req.query.page!==undefined) page=req.query.page;
      sort['page']=page;
      if(page<1) page=1;
      if(req.query.user!==undefined) options['user_id']=parseInt(req.query.user);
      if(req.query.problem!==undefined) options['problem']=parseInt(req.query.problem);
      sort['limit']=25; sort['offset']=25*(page-1);
      sql.submitHistory(options,sort,function(err2,result) {
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
    });
}
