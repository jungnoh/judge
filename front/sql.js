var mysql = require('mysql');
var result_codes = require('./tools/result_codes');
var logger = require('./tools/logger');
var bcrypt = require('./bcrypt');
var pool = mysql.createPool({
  connectionLimit: 30,
  user     : 'root',
  password : 'asdfasdf',
  database : 'judge'
});
//function getPoolConnection: Create and return a connection from mysql pool
//callback: function(conn,err) //conn null if connection failed
function getPoolConnection(callback) {
  pool.getConnection(function(err,conn) {
    if(err) {
      logger.logException(err,2);
      callback(null,err);
      return;
    }
    callback(conn,null);
  });
}
module.exports = {
  //function signupUser: Create a new user
  //The following options are MANDATORY: id, email, organization, password, nickname, comment
  //callback: function(err)
  //{id: , email: , organization: , password: , nickname: , comment: }
  addSubmit: function(submit_user_id,problem_id,lang,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('INSERT INTO `submit_history` (`problem_id`, `submit_user_id`, `lang`, `error_msg`) VALUES ('+mysql.escape(problem_id)+', '+mysql.escape(submit_user_id)+','+mysql.escape(lang)+',\'\')',
      function(err,result) {
        if(err) {
          logger.logException(err,2);
          callback(err,null);
          return;
        }
        callback(null,result.insertId);
      });
    });
  },
  signupUser: function(options,callback) {
    bcrypt.cryptPassword(options.password,function(cryptErr,passHash) {
      if(cryptErr) {
        callback(cryptErr);
        return;
      }
      getPoolConnection(function(conn,poolError) {
        if(!conn) {
          callback(poolError,null);
          return;
        }
        conn.query('INSERT INTO `users` (`id`, `email`, `organization`, `password`, `nickname`, `comment`) VALUES ('+mysql.escape(options.id)+', '+mysql.escape(options.email)+', '+mysql.escape(options.organization)+', '+mysql.escape(passHash)+', '+mysql.escape(options.nickname)+', '+mysql.escape(options.comment)+');',
        function(err) {
          if(err) {
            logger.logException(err,2);
            callback(err);
            return;
          }
          callback(null);
        });
      });
    });
  },
  //function userInfo_Username: Retrieve user information with matching id
  //callback: function(err,result)
  userInfo_Username: function(username,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from users where id='+mysql.escape(username),
      function(err, result) {
        if(err) {
          logger.logException(err,2);
          callback(err,null);
          return;
        }
        callback(null,result);
      });
    });
  },
  //function userLogin_Username: Retrieve id/password of matching id
  //callback: function(err,result)
  userLogin_Username: function(username,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select id, password from users where id='+mysql.escape(username),
      function(err, result) {
        if(err) {
          logger.logException(err,2);
          callback(err,null);
          return;
        }
        callback(null,result);
      });
    });
  },
  //function userExists_Email: Check if user exists with email
  //callback: function(err,result)
  userExists_Email: function(email,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select id from users where email='+mysql.escape(email),
      function(err, result) {
        if(err) {
          logger.logException(err,2);
          callback(err,null);
          return;
        }
        callback(null,result.length==1);
      });
    });
  },
  //function userExists_Email: Check if user exists with Username
  //callback: function(err,result)
  userExists_Username: function(id,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select id, password, nickname from users where id='+mysql.escape(username),
      function(err, result) {
        if(err) {
          logger.logException(err,2);
          callback(err,null);
          return;
        }
        callback(null,result);
      });
    });
  },
  //function problemInfo: Retrieve problem information
  //callback: function(err,result)
  problemInfo: function(problem_id,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from problems where id='+mysql.escape(problem_id),
      function(err, result) {
        if(err) {
          logger.logException(err,2);
        }
        callback(err,result);
      });
    });
  },
  //function problemStats: Return problem judge result stats
  //callback: function(err,result)
  problemStats: function(problem_id,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from problem_stats where problem_id='+mysql.escape(problem_id),
      function(err,result) {
        if(err) {
          logger.logException(err,2);
        }
        callback(err,result);
      });
    });
  },
  //function fetchSubmit: Submit history of a problem
  //callback: function(err,result)
  submitHistory: function(submit_id,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from submit_history where submit_id='+mysql.escape(submit_id),
      function(err,result) {
        if(err) {
          logger.logException(err,2);
        }
        callback(err,result);
      });
    });
  },
  //function updateCompileError: Updates compile error message
  //callback: function(err, rows)
  updateCompileError: function(submit_id,msg,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('update submit_history set error_msg='+mysql.escape(msg)+' where submit_id='+mysql.escape(submit_id),
      function(err,result) {
        if(err) {
          logger.logException(err,2);
        }
        callback(err,result);
      });
    });
  },
  //function updateJudgeResult: Updates judge result
  //callback: function(err, rows)
  updateJudgeResult: function(submit_id,problem_id,result,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('update submit_history set result='+mysql.escape(result)+' where submit_id='+mysql.escape(submit_id),
      function(err) {
        if(err) {
          logger.logException(err,2);
          callback(err);
          return;
        }
        var msg=result_codes.intToString(result);
        conn.query('select * from problem_stats where problem_id='+mysql.escape(problem_id),
        function(err2,result) {
          if(err2) {
            logger.logException(err2,2);
            callback(err2);
            return;
          }
          if(result.length != 1) {
            logger.logMessage('result.length is not 1',2);
            callback(0);
            return;
          }
          conn.query('update problem_stats set '+msg+'_count='+mysql.escape(result[0][msg+'_count']+1)+' where problem_id='+mysql.escape(problem_id),
          function(err3) {
            if(err3) {
              logger.logException(err3,2);
            }
            callback(err3);
          });
        });
      });
    });
  },
  //function updateJudgeUsageResult: Updates memory, time usage
  //callback: function(err,result)
  updateJudgeUsageResult: function(submit_id,time,mem,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,null);
        return;
      }
      console.log(mem); console.log(time); console.log(submit_id);
      conn.query('update submit_history set used_memory='+mysql.escape(mem)+',used_time='+mysql.escape(time)+' where submit_id='+mysql.escape(submit_id),
      function(err2,result) {
        if(err2) {
          logger.logException(err2,2);
        }
        callback(err,result);
      });
    });
  },
  //function appendSubmitCount: Adds +1 to submit count
  //callback: function(err)
  appendSubmitCount: function(problem_id,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('update problems set submit_count=submit_count+1 where id='+mysql.escape(problem_id),
      function(err2,result2) {
        if(err2) {
          logger.logException(err2,2);
          callback(err2);
        }
        conn.query('update problem_stats set submit_count=submit_count+1 where problem_id='+mysql.escape(problem_id),
        function(err3,result3) {
          if(err3) {
            logger.logException(err3,2);
            callback(err3);
          }
          callback();
        });
      });
    });
  },
  //function updateUserSolvedCount: Check if user has solved a problem before, and +1 to ac_user_count if user hasn't
  //callback: function(err,result), result is a boolean telling if ac_user_count was updated
  updateUserSolvedCount: function(userid,problemid,callback) {
    checkUserSolved(userid,problemid,function(err,result) {
      if(err) {
        callback(err,false);
        return;
      }
      if(!result) {
        getPoolConnection(function(conn,poolError) {
          if(!conn) {
            callback(poolError,null);
            return;
          }
          conn.query('update problem_stats set ac_users_count=ac_users_count+1 where problem_id='+mysql.escape(problemid),
          function(err2,result2) {
            if(err2) {
              callback(err2,false);
            }
            conn.query('update problems set accept_users=accpet_users+1 where id='+mysql.escape(problemid),
            function(err3,result3) {
              if(err3) {
                callback(err3,false);
              }
              callback(null,true);
            });
          });
        });
      }
    });
  },
  //function getLanguages: returns language list
  //callback: function(err,result)
  getLanguages: function(callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from `languages`', function(err,result) {
        if(err) {
          callback(poolError,null);
          return;
        }
        callback(null,result);
      });
    })
  },
  //function checkUserSolveStatus
  //callback: function(err,result)
  //result is 0 if the user hasn't tried yet, 1 if failed, 2 if succeeded
  checkUserSolveStatus: function(userid,problemid,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from `submit_history` where `submit_user_id`='+mysql.escape(userid)+' and `problem_id`='+mysql.escape(problemid),
      function(err,result) {
        if(err) {
          console.log(err);
          callback(err,null);
          return;
        }
        if(result.length==0) {
          callback(null,0);
          return;
        }
        for(var i=0;i<result.length;i++) {
          if(result[i].result==10) {
            callback(null,2);
            return;
          }
        }
        callback(null,1);
      });
    });
  },
  //function checkUserSolved: Check if user has solved a problem
  //callback: function(err,result)
  checkUserSolved: function(userid,problemid,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) {
        callback(poolError,null);
        return;
      }
      conn.query('select * from `submit_history` where `submit_user_id`='+mysql.escape(userid)+' and `problem_id`='+mysql.escape(problemid)+' and `result`=10',
      function(err,result) {
        if(err) {
          console.log(err);
          callback(err,null);
          return;
        }
        callback(null,result.length>0);
      });
    });
  }
};
