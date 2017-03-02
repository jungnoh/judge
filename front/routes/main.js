var sql       = require('./../sql');
var passport  = require('passport');
var fs        = require('fs-extra');
var judge     = require('./../judger/judge');
var languages = require('./../tools/languages');
var moment    = require('moment');
var winston   = require('winston');
var path      = require('path');
var escape    = require('escape-html');
var intMax    = 2147483647;


module.exports = function(app)
{
  app.get('/unauthorized',function(req,res) {
    res.render('unauthorized', {
      myid: req.user
    });
  })
  app.get('/',function(req,res){
    res.render('index',{
      myid: req.user
    });
  });
  app.get('/rank',function(req,res) {
    var page=1;
    if(req.query.page!==undefined) {
      if(!isNaN(req.query.page)) {
        page=parseInt(req.query.page,10);
        if(page<=0||page>intMax) page=1;
      }
    }
    sql.userRank(page,function(err,result) {
      if(err) {
        res.render('error.html');
        return;
      }
      if(result.length===0 && page>1) {
        sql.userCount(function(err,result) {
          var re_url='/rank?page='
          if(err) re_url+='1';
          else re_url+=Math.ceil(result/25);
          res.redirect(re_url);
          return;
        });
      }
      else res.render('rank', {
        myid: req.user,
        users: result,
        page: page
      });
    });
  });
  app.get('/result/detail/:id',function(req,res) {
    var submitID=0;
    if(!isNaN(req.params.id)) {
      submitID=parseInt(req.params.id,10);
      if(submitID<=0||submitID>intMax) {
        res.render('result-detail', {
          myid: req.user,
          found: 0
        });
      }
      sql.submitInfo(submitID, function(err,result) {
        if(err) {
          winston.error(err);
          res.render('error.html');
          return;
        }
        else if(result.length==0) {
          res.render('result-detail', {
            myid: req.user,
            found: 0
          });
          return;
        }
        fs.readFile(path.resolve(__dirname,'./../../usercode/'+submitID.toString()),function(readErr,data) {
          if(readErr) {
            winston.error(readErr);
            res.render('error.html');
            return;
          }
          var codeArray = data.toString().split("\n");
          var codeArrayString="[";
          for(var i=0;i<codeArray.length;i++) {
            var codeString = codeArray[i].replace(/\\/g,"\\\\\\\\")
                                      .replace(/\\'/g, "\\'")
                                      .replace(/\\"/g, '\\"')
                                      .replace(/\\&/g, "\\&")
                                      .replace(/\\r/g, "\\r")
                                      .replace(/\\t/g, "\\t")
                                      .replace(/\\b/g, "\\b")
                                      .replace(/\\f/g, "\\f")
                                      .replace(/[\u0000-\u0019]+/g,"");
            codeArrayString+=("\\x22"+escape(codeString)+"\\x22");
            if(i<codeArray.length-1) codeArrayString+=", ";
          }
          codeArrayString+=']'
          var now = moment(result[0].submit_time).utcOffset("+09:00");
          result[0].submit_time_text=now.fromNow();
          result[0].submit_time=now.format("YYYY.MM.DD A hh:mm:ss");
          res.render('result-detail', {
            myid: req.user,
            found: 1,
            submitInfo: result[0],
            code: codeArrayString,
            lang: languages
          });
        });
      });
    }
    else {
      res.render('result-detail', {
        myid: req.user,
        found: 0
      });
    }
  });
  app.get('/about',function(req,res){
      res.render('about.html');
  });
  app.get('/problems',function(req,res) {
    var page=1,startid=0,type=-1;
    if(req.query.page!==undefined) {
      if(!isNaN(req.query.page)) {
        page=parseInt(req.query.page,10);
        if(page<=0||page>intMax) page=1;
      }
    }
    if(req.query.startid!==undefined) {
      if(!isNaN(req.query.startid)) {
        startid=parseInt(req.query.startid,10);
        if(startid<0||startid>intMax) startid=0;
      }
    }
    if(req.query.startid!==undefined) {
      if(!isNaN(req.query.startid)) {
        startid=parseInt(req.query.startid,10);
        if(startid<0||startid>intMax) startid=0;
      }
    }
    if(req.query.type!==undefined) {
      if(!isNaN(req.query.type)) {
        type=parseInt(req.query.type,10);
      }
    }
    sql.problemList(page,startid,type,function(err,result) {
      if(err) {
        res.render('error.html');
        return;
      }
      sql.getTypes(function(typeError, types) {
        if(typeError) {
          res.render('error.html');
          return;
        }
        if(result.length===0 && page>1) {
          sql.problemCount(0,function(err,result) {
            var re_url='/problems?page='+Math.ceil(result/25);
            if(startid!==0) re_url+=('&startid='+startid);
            res.redirect(re_url);
            return;
          });
        }
        else {
          if(req.user!==undefined) {
            sql.userSolvedProblems(req.user.id,function(err3,problems) {
              if(err3) {
                res.render('error.html');
                return;
              }
              res.render('problem-list', {
                myid: req.user,
                problems: result,
                page: page,
                startid: startid,
                solved: problems.solved,
                tried: problems.tried,
                currentType: type,
                types: types
              });
            });
          }
          else res.render('problem-list', {
            myid: req.user,
            problems: result,
            page: page,
            startid: startid,
            solved: [],
            tried: [],
            currentType: type,
            types: types
          });
        }
      });
    });
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
        options['user_id']=parseInt(req.query.user,10);
        if(options['user_id']<0||options['user_id']>intMax) options['user_id']=undefined;
      }
    }
    if(req.query.problem!==undefined) {
      if(!isNaN(req.query.problem)) {
        options['problem']=parseInt(req.query.problem,10);
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
          if(count===1) page=1;
          else page=Math.ceil(count/25);
          query+='page='+(page).toString();
          res.redirect(query);
        });
      }
      else {
        for(var i=0;i<result.length;i++) {
          //var now = moment(result[i].submit_time).utcOffset("+09:00").locale('ko');
          var now = moment(result[i].submit_time).utcOffset("+09:00");
          result[i].submit_time_text=now.fromNow();
          result[i].submit_time=now.format("YYYY.MM.DD A hh:mm:ss");
        }
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
