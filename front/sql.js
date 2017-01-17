var mysql = require('mysql');
var result_codes = require('./tools/result_codes');
var logger = require('./tools/logger');
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
  //function userInfo_Username: Retrieve user information with matching id
  //callback: function(err,result)
  /*
  userInfo_Username: function(username,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,null);
        return;
      }
      conn.query('select id, ')
    });
  }, */
  //function userLogin_Username: Retrieve id/password of matching id
  //callback: function(err,result)
  userLogin_Username: function(username,callback) {
    getPoolConnection(function(conn,poolError) {
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
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
      if(!conn) callback(poolError,null);
      conn.query('select submit_count from problems where id='+mysql.escape(problem_id),
      function(err,result) {
        if(err) {
          logger.logException(err,2);
          callback(err);
        }
        else if(result.length!=1) {
          logger.logMessage('appendSubmitCount: result.length is not 1',2);
          callback(0);
        }
        else {
          conn.query('update problems set submit_count='+mysql.escape(result[0].submit_count+1)+' where id='+mysql.escape(problem_id),
          function(err2,result2) {
            if(err2) {
              logger.logException(err2,2);
              callback(err2);
            }
            conn.query('update problem_stats set submit_count='+mysql.escape(result[0].submit_count+1)+' where problem_id='+mysql.escape(problem_id),
            function(err3,result3) {
              if(err3) {
                logger.logException(err3,2);
                callback(err3);
              }
              callback();
            });
          });
        }
      });
    });
  }
};
