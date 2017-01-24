var sql=require('./../sql');
var passport=require('passport');
var fs=require('fs');
var judge=require('./../judger/judge');
var languages=require('./../tools/languages');
let intMax=2147483647;
module.exports = function(app)
{
    app.get('/',function(req,res){
      res.render('index',{
        myid: req.user
      });
    });
    app.get('/about',function(req,res){
        res.render('about.html');
    });
    app.get('/user/:id',function(req,res) {
      if(isNaN(req.params.id)) {
        res.render('error.html');
        return;
      }
      if(req.params.id<0||req.params.id>intMax) {
        res.render('error.html');
        return;
      }
      sql.userInfo_Userid(req.params.id,function(err,result) {
        res.render('user-info',{
          myid: req.user,
          stats: result[0]
        });
      })
    });
    app.get('/problems',function(req,res) {
      var page=1,startid=0;
      if(req.query.page!==undefined) {
        if(!isNaN(req.query.page)) {
          page=parseInt(req.query.page);
          if(page<=0||page>intMax) page=1;
        }
      }
      if(req.query.startid!==undefined) {
        if(!isNaN(req.query.startid)) {
          startid=parseInt(req.query.startid);
          if(startid<0||startid>intMax) startid=0;
        }
      }
      sql.problemList(page,startid,function(err,result) {
        if(err) {
          res.render('error.html');
          return;
        }
        if(result.length===0 && page>1) {
          var re_url='/problems?page='+(page-1);
          if(startid!=0) re_url+=('&startid='+startid);
          res.redirect(re_url);
          return;
        }
        else res.render('problem-list', {
          myid: req.user,
          problems: result,
          page: page,
          startid: startid
        });
      })
    });
    app.get('/result', function(req,res) {
      var page=-1,options={},sort={};
      if(req.query.page!==undefined) {
        if(!isNaN(req.query.page)) {
          page=req.query.page;
          if(page<0||page>intMax) page=-1;
        }
      }
      sort['page']=page;
      if(page<1) page=1;
      if(req.query.username!==undefined) options['username']=req.query.username;
      if(req.query.user!==undefined) {
        if(!isNaN(req.query.user)) {
          options['user_id']=parseInt(req.query.user);
          if(options['user_id']<0||options['user_id']>intMax) options['user_id']=undefined;
        }
      }
      if(req.query.problem!==undefined) {
        if(!isNaN(req.query.problem)) {
          options['problem']=parseInt(req.query.problem);
          if(options['problem']<0||options['problem']>intMax) options['problem']=undefined;
        }
      }
      sort['limit']=25; sort['offset']=25*(page-1);
      sql.submitHistory(options,sort,function(err2,result) {
        if(err2) {
          console.log(err2);
          res.render('error.html');
          return;
        }
        if(result.length===0&&req.query!==undefined&&page>1) {
          var query='/result?';
          for(var property in req.query) {
            if(req.query.hasOwnProperty(property)) {
              if(property==='page') continue;
              query+=property+'='+req.query[property]+'&';
            }
          }
          sql.submitCount(options, function(err3,count) {
            if(err3) {
              console.log(err3);
              res.render('error.html');
              return;
            }
            if(count==1) page=1;
            else page=Math.ceil(count/25);
            query+='page='+(page).toString();
            res.redirect(query);
          });
        }
        else {
          res.render('judge-result', {
            myid: req.user,
            lang: languages,
            page: page,
            id: req.params.id,
            submits: result,
            noResults: result.length===0
          });
        }
      });
    });
}
