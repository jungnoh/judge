var sql       = require('./../sql');
var passport  = require('passport');
var fs        = require('fs-extra');
var judge     = require('./../judger/judge');
var languages = require('./../tools/languages');
var fileman   = require('./file-manager');
var moment    = require('moment');
var winston   = require('winston');
var path      = require('path');
var escape    = require('escape-html');
var i18n      = require('i18n');
var intMax    = 2147483647;

function checkNum(num) {
  if(typeof(num)=='undefined'||num===null) return false;
  else if(isNaN(num)) return false;
  else if(num<0||num>intMax) return false;
  else return true;
}
module.exports = function(app)
{
  app.get('/sudo',function(req,res) {
    res.render('sudo/index', {
      myid: req.user
    });
  });
  app.get('/sudo/toggleActive/:id',function(req,res) {
    sql.toggleProblemActive(req.params.id,function(err,result) {
      if(err) {
        res.render('error.html');
      }
      res.redirect(req.query.return||'/sudo/problems');
    })
  });
  app.get('/sudo/problems/edit/:id',function(req,res) {
    sql.problemInfo(req.params.id, function(err,result) {
      if(err) {
        res.render('error.html');
      } else if(result.length!=1) {
          res.render('sudo/problem-edit', {
            found: 0,
            myid: req.user
          });
      } else {
        res.render('sudo/problem-edit', {
          found: 1,
          problem: result[0],
          myid: req.user
        })
      }
    });
  });
  app.get('/sudo/updateCount/:id',function(req,res) {
    if(req.params.id!==undefined) {
      if(isNaN(req.params.id)) return res.redirect(req.query.return || '/sudo/problems');
      else if(parseInt(req.params.id)<0||parseInt(req.params.id)>intMax) return res.redirect(req.query.return || '/sudo/problems');
    }
    else return res.redirect(req.query.return || '/sudo/problems');
    fs.readdir(path.resolve('./../cases/'+req.params.id.toString()),function(err,files) {
      if(err) {
        return res.status(500).send('Error while executing readdir');
      }
      sql.updateCaseCount(req.params.id,Math.floor(files.length/2),function(err2) {
        if(err2) {
          return res.status(500).send('Error while updating count');
        }
        return res.redirect(req.query.return || '/sudo/problems');
      });
    });
  });
  app.get('/sudo/problems/add',function(req,res) {
    res.render('sudo/problem-add', {
      myid: req.user
    })
  });
  app.post('/sudo/problems/:id/update',function(req,res) {
    if(!checkNum(req.params.id)||!checkNum(req.body.time_limit)||!checkNum(req.body.memory_limit)) {
      res.json('{success: 0}');
      return;
    }
    var id=parseInt(req.params.id);
    var data={title: req.body.title,
              description: req.body.description,
              input_desc: req.body.input_desc,
              output_desc: req.body.output_desc,
              hint: req.body.hint,
              time_limit: req.body.time_limit,
              memory_limit: req.body.memory_limit,
              sample_input: req.body.sample_input,
              sample_output: req.body.sample_output,
              source: req.body.source};
    sql.editProblem(id,data,function(err) {
      if(err) {
        res.json('{success: 0}');
        return;
      }
      res.json('{success: 1}');
      return;
    });
  });
  app.post('/sudo/problems/add',function(req,res) {
    if(!checkNum(req.body.time_limit)||!checkNum(req.body.memory_limit)) {
      res.json('{success: 0}');
      return;
    }
    var data={title: req.body.title,
              description: req.body.description,
              input_desc: req.body.input_desc,
              output_desc: req.body.output_desc,
              hint: req.body.hint,
              time_limit: req.body.time_limit,
              memory_limit: req.body.memory_limit,
              sample_input: req.body.sample_input,
              sample_output: req.body.sample_output,
              source: req.body.source};
    sql.addProblem(data,function(err,problemID) {
      if(err) {
        res.json('{success: 0}');
        return;
      }
      fs.mkdir(path.join('./../cases/',problemID.toString()),function(err2) {
        if(err2) {
          res.json('{success: 0}');
          return;
        }
        else {
          res.json('{success: 1}');
          return;
        }
      });
    });
  });
  app.get('/sudo/problems/delete/:id',function(req,res) {
    console.log('got');
    sql.deleteProblem(req.params.id,function(err) {
      if(err) res.status(500).end('Error while deleting problem');
      else res.status(200).end('Successfully deleted problem');
    });
  });
  app.get('/sudo/problems',function(req,res) {
    var page=1,startid=0;
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
    sql.problemListRoot(page,startid,function(err,result) {
      if(err) {
        res.render('error.html');
        return;
      }
      if(result.length===0 && page>1) {
        var re_url='/sudo/problems?page='+(page-1);
        if(startid!==0) re_url+=('&startid='+startid);
        res.redirect(re_url);
        return;
      }
      else res.render('sudo/problems', {
        myid: req.user,
        problems: result,
        page: page,
        startid: startid
      });
    });
  });
};
