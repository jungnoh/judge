var mysql        = require('mysql');
var result_codes = require('./tools/result_codes');
var bcrypt       = require('./bcrypt');
var winston      = require('winston');
var fs           = require('fs-extra');
var poolConfig   = JSON.parse(fs.readFileSync('sql-config.json'));
var pool = mysql.createPool(poolConfig);

function getPoolConnection(callback) {
  pool.getConnection(function(err,conn) {
    if(err) {
      winston.error(err);
      callback(err,null);
      conn.release();
    }
    else {
      callback(null,conn);
      conn.release();
    }
  });
}
function singleQuery(query, callback) {
  getPoolConnection(function(poolError,conn) {
    if(poolError) {
      callback(poolError,null);
      return;
    }
    else conn.query(query, function(queryError,result) {
      if(queryError) {
        winston.error(queryError);
        callback(queryError,null);
      }
      else callback(null,result);
    });
  });
}

module.exports = {
  boardList: function(page, options, callback) {
    var query='select * from board_post',queryCount=0;
    if(options!=null) {
      query+=' where ';
      if(options.subjectProblem!==undefined) {
        queryCount++;
        query+='subject_problem='+mysql.escape(options.subjectProblem);
      }
      if(options.subject!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='subject='+mysql.escape(options.subject);
      }
    }
    query+=' order by upload_time desc limit 25';
    console.log(query);
    singleQuery(query, function(err,result) {
      callback(err,result);
      return;
    });
  },
  boardCount: function(page, options, callback) {
    var query='select count(*) from board_post',queryCount=0;
    if(options!=null) {
      query+=' where ';
      if(options.subjectProblem!==undefined) {
        queryCount++;
        query+='subject_problem='+mysql.escape(options.subjectProblem);
      }
      if(options.subject!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='subject='+mysql.escape(options.subject);
      }
    }
    console.log(query);
    singleQuery(query, function(err,result) {
      callback(err,result[0]['count(*)']);
      return;
    });
  },//sql.boardCommentAdd(req.user.id,req.user.nickname,req.body.subject,req.body.title,req.body.content,

  boardPost: function(id, callback) {
    singleQuery('select * from board_post where id='+mysql.escape(id), function(err,post) {
      if(err) {
        callback(err,null);
        return;
      }
      callback(null, post[0]);
    });
  },
  boardPostWrite: function(authorID, authorNick, subject, subjectProblem, title, content, callback) {
    singleQuery('insert into board_post (`author`,`author_nick`,`subject`,`subject_problem`,`title`,`content`) values ('
    +mysql.escape(authorID)+','+mysql.escape(authorNick)+','+mysql.escape(subject)+','+mysql.escape(subjectProblem)+','+mysql.escape(title)+','+mysql.escape(content)+')', function(err,result) {
      callback(err,result.insertId);
    });
  },
  boardComment: function(id, page, callback) {
    singleQuery('select * from board_comment where parent_id='+mysql.escape(id)+' order by upload_time desc limit 20', function(err,comments) {
      if(err) {
        callback(err,null);
        return;
      }
      callback(null,comments);
    });
  },
  boardCommentAdd: function(postID, authorID, authorNick, content, callback) {
    singleQuery('insert into board_comment (`parent_id`,`author_id`,`author_nick`,`content`) values ('+mysql.escape(postID)+','+mysql.escape(authorID)+','+mysql.escape(authorNick)+','+mysql.escape(content)+')', function(err) {
      callback(err);
    });
  },
  boardCommentCount: function(id, callback) {
    singleQuery('select count(*) from board_comment where parent_id='+mysql.escape(id), function(err,result) {
      if(err) {
        callback(err,null);
        return;
      }
      callback(null,result[0]['count(*)']);
    });
  },
  addType: function(title, desc, callback) {
    singleQuery('insert into types (`title`, `description`) values ('+mysql.escape(title)+','+mysql.escape(desc)+')', function(err,result) {
      callback(err,result.insertId);
      return;
    });
  },
  updateType: function(id, title, desc, callback) {
    singleQuery('update types set `title`='+mysql.escape(title)+', `description`='+mysql.escape(desc)+' where `id`='+mysql.escape(id), function(err) {
      callback(err);
      return;
    });
  },
  deleteType: function(id, callback) {
    singleQuery('update problems set `type`=0 where `type`='+mysql.escape(id), function(err2) {
      if(err2) {
        callback(err2);
        return;
      }
      singleQuery('delete from types where id='+mysql.escape(id),function(err) {
        if(err) callback(err);
        else callback(null);
      });
    })
  },
  getTypes: function(callback) {
    singleQuery('select * from types', function(err,result) {
      callback(err,result);
      return;
    });
  },
  getTypeTitle: function(id, callback) {
    singleQuery('select title from types where id='+mysql.escape(id), function(err, result) {
      if(err) callback(err, null);
      else callback(null, result.length===0?'':result[0].title);
    });
  },
  editProblem: function(id,data,callback) {
    var query='UPDATE `problems` SET `title` = '+mysql.escape(data.title)
    +', `description` = '+mysql.escape(data.description)
    +', `input_desc` = '+mysql.escape(data.input_desc)
    +', `output_desc` = '+mysql.escape(data.output_desc)
    +', `hint` = '+mysql.escape(data.hint)
    +', `time_limit` = '+mysql.escape(data.time_limit)
    +', `memory_limit` = '+mysql.escape(data.memory_limit)
    +', `sample_input` = '+mysql.escape(data.sample_input)
    +', `sample_output` = '+mysql.escape(data.sample_output)
    +', `source` = '+mysql.escape(data.source)
    +', `type` = '+mysql.escape(data.type)
    +' WHERE `problems`.`id` = '+id;
    singleQuery(query,
    function(err) {
      if(err) callback(err);
      else callback(null);
    });
  },
  addProblem: function(data,callback) {
    var query='insert into `problems` (`title`, `description`, `input_desc`, `output_desc`, `hint`, `time_limit`, `memory_limit`, `sample_input`, `sample_output`, `source`, `type`) values ('
    +mysql.escape(data.title)
    +', '+mysql.escape(data.description)
    +', '+mysql.escape(data.input_desc)
    +', '+mysql.escape(data.output_desc)
    +', '+mysql.escape(data.hint)
    +', '+mysql.escape(data.time_limit)
    +', '+mysql.escape(data.memory_limit)
    +', '+mysql.escape(data.sample_input)
    +', '+mysql.escape(data.sample_output)
    +', '+mysql.escape(data.source)
    +', '+mysql.escape(data.type)
    +')';
    singleQuery(query,
    function(err,result) {
      if(err) callback(err,null);
      else {
        singleQuery('INSERT INTO `problem_stats` (`problem_id`) VALUES ('+mysql.escape(result.insertId)+')',function(err2) {
          if(err2) callback(err2,null);
          else callback(null,result.insertId);
        });
      }
    });
  },
  deleteProblem: function(id,callback) {
    singleQuery('delete from problems where id='+mysql.escape(id),function(err) {
      if(err) callback(err);
      else callback(null);
    });
  },
  toggleProblemActive: function(id,callback) {
    singleQuery('select active from problems where id='+mysql.escape(id), function(err,result) {
      if(err) callback(err,null);
      else if(result.length<1) callback(null,false);
      else {
        var query='update problems set active=';
        if(result[0].active) query+='false';
        else query+='true';
        query+=(' where id='+mysql.escape(id));
        singleQuery(query,function(err2) {
          if(err2) callback(err2,false);
          else callback(null,true);
        });
      }
    });
  },
  updateCaseCount: function(problem_id,case_count,callback) {
    singleQuery('update problems set case_count='+mysql.escape(case_count)+' where id='+mysql.escape(problem_id), function(err) {
      if(err) callback(err);
      else callback(null);
    });
  },
  addSubmit: function(submit_user_id,submit_user_name,problem_id,lang,callback) {
    singleQuery('INSERT INTO `submit_history` (`problem_id`, `submit_user_id`, `submit_user_name`,`lang`, `error_msg`) VALUES ('+mysql.escape(problem_id)+', '+mysql.escape(submit_user_id)+','+mysql.escape(submit_user_name)+','+mysql.escape(lang)+',\'\')',
    function(err,result) {
      if(err) {
        callback(err,null);
      }
      else callback(null,result.insertId);
    });
  },
  signupUser: function(options,callback) {
    bcrypt.cryptPassword(options.pw,function(cryptErr,passHash) {
      if(cryptErr) {
        winston.error(cryptErr);
        callback(cryptErr);
        return;
      }
      singleQuery('INSERT INTO `users` (`id`, `email`, `organization`, `password`, `nickname`, `comment`) VALUES ('+mysql.escape(options.id)+', '+mysql.escape(options.email)+', '+mysql.escape(options.organization)+', '+mysql.escape(passHash)+', '+mysql.escape(options.nickname)+', '+mysql.escape('')+');',
      function(err,result) {
        if(err) {
          callback(err,null);
        }
        else callback(null,result.insertId);
      });
    });
  },
  userInfo_Username: function(username,callback) {
    singleQuery('select * from users where id='+mysql.escape(username), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  userInfo_Userid: function(userid,callback) {
    singleQuery('select * from users where user_id='+mysql.escape(userid), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  userLogin_Username: function(username,callback) {
    singleQuery('select id, password from users where id='+mysql.escape(username), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  userSolvedProblems: function(id,callback) {
    singleQuery('select problem_id, result from submit_history where submit_user_id='+mysql.escape(id)+' order by problem_id', function(err,result) {
      if(err) callback(err,null);
      else {
        var correct=[],tried=[];
        //typeof arrayName[index] === 'undefined'
        for(var i=0;i<result.length;i++) {
          if(result[i].result===10) {
            if(correct.length==0||correct[correct.length-1]!=result[i].problem_id) {
              correct.push(result[i].problem_id);
            }
          }
        }
        for(var i=0;i<result.length;i++) {
          if(result[i].result!==10) {
            var start=0,end=correct.length-1,value=-1;
            //binary search
            while(start<=end) {
              console.log(start+" "+end);
              var mid=Math.floor((start+end)/2);
              if(correct[mid]===result[i].problem_id) {
                value=mid;
                break;
              }
              if(correct[mid]>result[i].problem_id) {
                end=mid-1;
              }
              else start=mid+1;
            }
            if(value<0) {
              if(tried.length===0||tried[tried.length-1]!=result[i].problem_id) {
                tried.push(result[i].problem_id);
              }
            }
          }
        }
        callback(null,{solved:correct, tried:tried});
      }
    });
  },
  userExists: function(id,email,callback) {
    singleQuery('select id from users where email='+mysql.escape(email)+' or id='+mysql.escape(id), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result.length===1);
    });
  },
  problemInfo: function(problem_id,callback) {
    singleQuery('select * from problems where id='+mysql.escape(problem_id), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  problemStats: function(problem_id,callback) {
    singleQuery('select * from problem_stats where problem_id='+mysql.escape(problem_id), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  problemList: function(page,numberStart,type,callback) {
    var offset=0;
    if(page!==null) {
      offset=(page-1)*25;
    }
    var query='select id, title, submit_count, accept_count, active, type from problems where id>='+mysql.escape(numberStart)+' and active=true';
    if(type>=0) query+=' and type='+mysql.escape(type);
    query+=' order by id limit 25 offset '+mysql.escape(offset)
    singleQuery(query, function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  problemListRoot: function(page,numberStart,type,callback) {
    var offset=0;
    if(page!==null) {
      offset=(page-1)*25;
    }
    var query='select id, title, submit_count, accept_count, active, type from problems where id>='+mysql.escape(numberStart);
    if(type>=0) query+=' and type='+mysql.escape(type);
    query+=' order by id limit 25 offset '+mysql.escape(offset)
    singleQuery(query, function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  problemCount: function(includeHidden, callback) {
    var query='select count(*) from problems';
    if(includeHidden===0) query+=' where active=true';
    singleQuery(query, function(err,result) {
      if(err) callback(err,null);
      else callback(null,result[0]['count(*)']);
    });
  },
  submitCount: function(options,callback) {
    var query='select count(*) from submit_history', queryCount=0;
    if(options!==null && Object.keys(options).length>0) {
      query+=' where '
      if(options.problem!==undefined) {
        queryCount++;
        query+='problem_id='+mysql.escape(options.problem);
      }
      if(options.user_id!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='submit_user_id='+mysql.escape(options.user_id);
      }
      if(options.lang!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='lang='+mysql.escape(options.lang);
      }
      if(options.username!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='submit_user_name='+mysql.escape(options.username);
      }
    }
    singleQuery(query, function(err,result) {
      if(err) callback(err,null);
      else callback(null,result[0]['count(*)']);
    });
  },
  submitHistory: function(options,sortOptions,callback) {
    var query='select * from submit_history', queryCount=0;
    if(options!==null && Object.keys(options).length>0) {
      query+=' where '
      if(options.problem!==undefined) {
        queryCount++;
        query+='problem_id='+mysql.escape(options.problem);
      }
      if(options.user_id!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='submit_user_id='+mysql.escape(options.user_id);
      }
      if(options.lang!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='lang='+mysql.escape(options.lang);
      }
      if(options.type!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='type='+mysql.escape(options.type);
      }
      if(options.username!==undefined) {
        if(queryCount>0) query+=' and ';
        queryCount++;
        query+='submit_user_name='+mysql.escape(options.username);
      }
    }
    query+=' order by submit_id desc';
    if(sortOptions!==null && Object.keys(sortOptions).length>0) {
      if(sortOptions.limit!==undefined) {
        query+=' limit '+sortOptions.limit;
      }
      if(sortOptions.offset!==undefined) {
        query+=' offset '+sortOptions.offset;
      }
    }
    singleQuery(query, function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  userRank: function(page,callback) {
    singleQuery('select user_id,id, nickname, submit_count, ac_count, ac_problem_count, ac_rate from users order by ac_problem_count desc, ac_rate desc limit 25 offset '+mysql.escape(25*(page-1)), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  getUserRank: function(id,callback) {
    singleQuery('SELECT (select COUNT(*)+1 from users where ac_problem_count>t.ac_problem_count or (ac_problem_count=t.ac_problem_count and ac_rate>t.ac_rate)) as rank from users as t where user_id='+mysql.escape(id), function(err,result) {
      if(err) callback(err,null);
      else if(result.length===0) callback(null,-1);
      else callback(null,result[0].rank);
    });
  },
  userCount: function(callback) {
    singleQuery('select count(*) from users', function(err,result) {
      if(err) callback(err,null);
      else callback(null,result[0]['count(*)']);
    });
  },
  submitInfo: function(submit_id,callback) {
    singleQuery('select * from submit_history where submit_id='+mysql.escape(submit_id), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  updateCompileError: function(submit_id,msg,callback) {
    singleQuery('update submit_history set error_msg='+mysql.escape(msg)+' where submit_id='+mysql.escape(submit_id), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  //function updateJudgeResult: Updates judge result
  //callback: function(err, rows)
  updateJudgeResult: function(submit_id,problem_id,user_id,resultCode,callback) {
    getPoolConnection(function(poolError,conn) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('update submit_history set result='+mysql.escape(resultCode)+' where submit_id='+mysql.escape(submit_id),
      function(err) {
        if(err) {
          winston.error(err);
          callback(err);
          return;
        }
        if(resultCode>2) {
          var msg=result_codes.intToString(resultCode);
          conn.query('update problem_stats set '+msg+'_count='+msg+'_count+1 where problem_id='+mysql.escape(problem_id),
          function(err2) {
            if(err2) {
              winston.error(err2);
              callback(err2);
              return;
            }
            conn.query('update users set '+msg+'_count='+msg+'_count+1 where user_id='+mysql.escape(user_id),
            function(err3) {
              if(err3) {
                winston.error(err3);
                callback(err3);
                return;
              }
              if(resultCode===10) {
                conn.query('update problems set accept_count=accept_count+1 where id='+mysql.escape(problem_id),
                function(err4) {
                  if(err4) {
                    winston.error(err4);
                    callback(err4);
                    return;
                  }
                  callback(null);
                  return;
                });
              }
              else {
                callback(null);
                return;
              }
            });
          });
        }
        else {
          callback(null);
          return;
        }
      });
    });
  },
  //function updateJudgeUsageResult: Updates memory, time usage
  //callback: function(err,result)
  updateJudgeUsageResult: function(submit_id,time,mem,callback) {
    singleQuery('update submit_history set used_memory='+mysql.escape(mem)+',used_time='+mysql.escape(time)+' where submit_id='+mysql.escape(submit_id), function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  //function appendSubmitCount: Adds +1 to submit count
  //callback: function(err)
  appendSubmitCount: function(problem_id,user_id,callback) {
    getPoolConnection(function(poolError,conn) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('update problems set submit_count=submit_count+1 where id='+mysql.escape(problem_id),
      function(err2,result2) {
        if(err2) {
          winston.error(err2);
          callback(err2);
          return;
        }
        conn.query('update problem_stats set submit_count=submit_count+1 where problem_id='+mysql.escape(problem_id),
        function(err3,result3) {
          if(err3) {
            winston.error(err3);
            callback(err3);
            return;
          }
          conn.query('update users set submit_count=submit_count+1 where user_id='+mysql.escape(user_id),
          function(err4, result4) {
            if(err4) {
              winston.error(err4);
            }
            callback(err4);
            return;
          })
        });
      });
    });
  },
  //function updateUserJudgeCount: Update User judge result count
  //callback: function(err,success)
  updateUserJudgeCount: function(userid,result,callback) {
    var msg=result_codes.intToString(result);
    singleQuery('update users set '+msg+'_count='+msg+'_count+1 where user_id='+mysql.escape(userid),function(err) {
      if(err) callback(err,false);
      else callback(null,true);
    });
  },
  //function updateUserSolvedCount: Check if user has solved a problem before, and +1 to ac_user_count if user hasn't
  //callback: function(err,result), result is a boolean telling if ac_user_count was updated
  updateUserSolvedCount: function(userid,problemid,callback) {
    getPoolConnection(function(poolError,conn) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from `submit_history` where `submit_user_id`='+mysql.escape(userid)+' and `problem_id`='+mysql.escape(problemid)+' and `result`=10',
      function(err,result) {
        if(err) {
          winston.error(err);
          callback(err,null);
          return;
        }
        if(result.length<2) {
          conn.query('update problem_stats set ac_users_count=ac_users_count+1 where problem_id='+mysql.escape(problemid),
          function(err2) {
            if(err2) {
              winston.error(err2);
              return;
            }
            conn.query('update problems set accept_users=accept_users+1 where id='+mysql.escape(problemid),
            function(err3) {
              if(err3) {
                winston.error(err3);
                return;
              }
              conn.query('update users set ac_problem_count=ac_problem_count+1 where user_id='+mysql.escape(userid),
              function(err4) {
                if(err4) {
                  winston.error(err4);
                  return;
                }
                callback(null,true);
                return;
              })
            });
          });
        }
        else {
          callback(null,false);
          return;
        }
      });
    });
  },
  //function getLanguages: returns language list
  //callback: function(err,result)
  getLanguages: function(callback) {
    singleQuery('select * from `languages`',function(err,result) {
      if(err) callback(err,null);
      else callback(null,result);
    });
  },
  //function checkUserSolveStatus
  //callback: function(err,result)
  //result is 0 if the user hasn't tried yet, 1 if failed, 2 if succeeded
  checkUserSolveStatus: function(userid,problemid,callback) {
    singleQuery('select * from `submit_history` where `submit_user_id`='+mysql.escape(userid)+' and `problem_id`='+mysql.escape(problemid), function(err,result) {
      if(err) callback(err,null);
      else {
        if(result.length===0) {
          callback(null,0);
          return;
        }
        for(var i=0;i<result.length;i++) {
          if(result[i].result===10) {
            callback(null,2);
            return;
          }
        }
        callback(null,1);
      };
    });
  },
  checkUserSolved: function(userid,problemid,callback) {
    singleQuery('select * from `submit_history` where `submit_user_id`='+mysql.escape(userid)+' and `problem_id`='+mysql.escape(problemid)+' and `result`=10', function(err,result) {
      if(err) callback(err,null);
      else callback(null,result.length>0);
    });
  }
};
