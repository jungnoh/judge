var sql       = require('./../sql');
var passport  = require('passport');
var fs        = require('fs');
var judge     = require('./../judger/judge');
var i18n      = require('i18n');
var moment    = require('moment');
const intMax  = 2147483647;

module.exports = function(app)
{
  app.get('/board/write',function(req,res) {
    if(typeof req.user==="undefined"||req.user===null) {
      res.render('unauthorized', {
        myid: req.user
      });
      return;
    }
    res.render('./board/write', {
      myid: req.user,
      subjectProblem: (req.query.subjectProblem==undefined||req.query.subjectProblem==null)?0:req.query.subjectProblem
    });
  });
  app.put('/board/post/:id/delete',function(req,res) {
    sql.boardPost(req.params.id, function(err,post) {
      if(err) {
        res.status(500).end('Server Error');
      }
      if(post==undefined||post==null) {
        res.status(404).end('Post not Found');
      }
      if(req.user==null?false:(req.user.id==post.author||((req.user.permissions>>3)%2))) {
        sql.boardPostDelete(req.params.id, function(err2) {
          if(err2) res.status(500).end('Server Error');
          else res.status(200).end('Ok');
        });
      } else {
        res.status(403).end('Unauthorized');
      }
    });
  });
  app.post('/board/post/:id/comment',function(req,res) {
    if(req.user==null||req.user==undefined) {
      res.status(403).end('Unauthorized');
      return;
    }
    sql.boardCommentAdd(req.params.id,req.user.id,req.user.nickname,req.body.content, function(err) {
      if(err) res.status(500).end('Server Error');
      else res.status(200).end('Success');
    });
  });
  app.post('/board/post/write',function(req,res) {
    if(req.user==null||req.user==undefined) {
      res.status(403).end('Unauthorized');
      return;
    }
    var subjectProblem=0;
    if(req.body.subjectProblem!=null&&req.body.subjectProblem != undefined) subjectProblem = req.body.subjectProblem;
    sql.boardPostWrite(req.user.id,req.user.nickname,req.body.subject,subjectProblem,req.body.title,req.body.content, function(err,result) {
      if(err) res.status(500).end('Server Error');
      else res.status(200).end(result.toString());
    });
  });
  app.get('/board/post/:id',function(req,res) {
    sql.boardPost(req.params.id, function(err,post) {
      if(err) {
        res.render('./../error.html');
        return;
      }
      if(post==undefined||post==null) {
        res.render('./board/detail', {
          myid: req.user,
          found: false,
          cpage: 0
        });
        return;
      }
      var now = moment(post.upload_time).utcOffset("+09:00").locale('ko');
      post.upload_time_text=now.fromNow();
      post.upload_time=now.format("YYYY.MM.DD A hh:mm:ss");
      var cpage=1;
      if(req.query.cpage!=undefined) cpage=parseInt(req.query.cpage);
      if(cpage<1) cpage=1;
      sql.boardComment(req.params.id,cpage,function(err2,comments) {
        if(err2) {
          res.render('./../error.html');
          return;
        }
        if(comments.length==0&&cpage>1) {
          sql.boardCommentCount(req.params.id, function(err3, count) {
            res.redirect('/board/post/'+req.params.id+'?cpage='+(count==0?1:(Math.floor((count-1)/20)+1)));
            return;
          });
        }
        for(var i=0;i<comments.length;i++) {
          var now = moment(comments[i].upload_time).utcOffset("+09:00").locale('ko');
          //var now = moment(result[i].submit_time).utcOffset("+09:00");
          comments[i].upload_time_text=now.fromNow();
          comments[i].upload_time=now.format("YYYY.MM.DD A hh:mm:ss");
        }
        res.render('./board/detail', {
          myid: req.user,
          subject: req.query.subject,
          found: true,
          post: post,
          isPrivileged: req.user==null?false:(req.user.id==post.author||((req.user.permissions>>3)%2)),
          cpage: cpage,
          comments: comments
        });
      });
    });
  });
  app.get('/board/free',function(req,res) {
    res.redirect('/board?subject=free');
  });
  app.get('/board/code',function(req,res) {
    res.redirect('/board?subject=code');
  });
  app.get('/board/qna',function(req,res) {
    res.redirect('/board?subject=qna');
  });
  app.get('/board/help',function(req,res) {
    res.redirect('/board?subject=help');
  });
  app.get('/board',function(req,res) {
    var options={},elementCount=0,page=1;
    if(req.query.page!=undefined) page=parseInt(req.query.page);
    if(page<1) page=1;
    if(req.query.subjectProblem!=undefined) {
      options["subjectProblem"]=req.query.subjectProblem;
      elementCount++;
    }
    if(req.query.subject!=undefined) {
      options["subject"]=req.query.subject;
      elementCount++;
    }
    sql.boardList(page,elementCount==0?null:options,function(err,result) {
      if(err) {
        res.render('./../error.html');
        return;
      }
      if(result.length==0&&page>1) {
        sql.boardCount(page,elementCount==0?null:options,function(err2,postCount) {
          console.log(postCount);
          page=(postCount==0?0:Math.floor((postCount-1)/25))+1;
          sql.boardList(page,elementCount==0?null:options,function(err,result) {
            if(err) {
              res.render('./../error.html');
              return;
            }
            for(var i=0;i<result.length;i++) {
              var now = moment(result[i].upload_time).utcOffset("+09:00").locale('ko');
              //var now = moment(result[i].submit_time).utcOffset("+09:00");
              result[i].upload_time_text=now.fromNow();
              result[i].upload_time=now.format("YYYY.MM.DD A hh:mm:ss");
            }
            res.render('board/list', {
              myid: req.user,
              page: page,
              subject: req.query.subject,
              posts: result,
              subjectProblem: (req.query.subjectProblem==undefined||req.query.subjectProblem==null)?0:req.query.subjectProblem
            });
          });
        });
      }
      else {
        for(var i=0;i<result.length;i++) {
          var now = moment(result[i].upload_time).utcOffset("+09:00").locale('ko');
          //var now = moment(result[i].submit_time).utcOffset("+09:00");
          result[i].upload_time_text=now.fromNow();
          result[i].upload_time=now.format("YYYY.MM.DD A hh:mm:ss");
        }
        res.render('board/list', {
          myid: req.user,
          page: page,
          subject: req.query.subject,
          posts: result,
          subjectProblem: (req.query.subjectProblem==undefined||req.query.subjectProblem==null)?0:req.query.subjectProblem
        });
      }
    });
  });
};
