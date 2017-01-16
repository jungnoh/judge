var mysql = require('mysql');
var result_codes = require('./tools/result_codes');
var logger = require('./tools/logger');
var pool = mysql.createPool({
  connectionLimit: 30,
  user     : 'root',
  password : 'asdfasdf',
  database : 'judge'
});
module.exports = {
  //function userInfo_ID: Retrieve user information with matching id
  //callback: function(err,result)
  userInfo_ID: function(userID,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,null);
        return;
      }
      conn.query('')
    });
  },
  userInfo_Username: function(username,callback) {

  },
  userInfo_Nickname: function(nickname,callback) {

  },
  problemInfo: function(problem_id,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,[]);
        return;
      }
      conn.query('select * from problems where id='+mysql.escape(problem_id),function(err2,result) {
        if(err2) {
          logger.logException(err2,2);
        }
        callback(err2,result);
      });
    });
  },
  problemStats: function(problem_id,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,[]);
        return;
      }
      conn.query('select * from problem_stats where problem_id='+mysql.escape(problem_id),function(err2,result) {
        if(err2) {
          logger.logException(err2,2);
        }
        callback(err2,result);
      });
    });
  },
  //function fetchSubmit: Queries and returns information of a submit id
  //callback: function(err, rows)
  fetchSubmit: function(submit_id,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,null);
        return;
      }
      conn.query('select * from submit_history where submit_id='+mysql.escape(submit_id),function(err2,result) {
        if(err2) {
          logger.logException(err2,2);
        }
        callback(err2,result);
      });
    });
  },
  //function updateCompileError: Updates compile error message
  //callback: function(err, rows)
  updateCompileError: function(submit_id,msg,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,null);
        return;
      }
      conn.query('update submit_history set error_msg='+mysql.escape(msg)+' where submit_id='+mysql.escape(submit_id),
      function(err2,result) {
        if(err2) {
          logger.logException(err2,2);
        }
        callback(err2,result);
      });
    });
  },
  //function updateJudgeResult: Updates judge result
  //callback: function(err, rows)
  updateJudgeResult: function(submit_id,problem_id,result,callback) {
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,null);
        return;
      }
      conn.query('update submit_history set result='+mysql.escape(result)+' where submit_id='+mysql.escape(submit_id),
      function(err2) {
        if(err2) {
          logger.logException(err2,2);
          callback(err2);
          return;
        }
        var msg=result_codes.intToString(result);
        conn.query('select * from problem_stats where problem_id='+mysql.escape(problem_id),
        function(err3,result) {
          if(err3) {
            logger.logException(err3,2);
            callback(err3);
            return;
          }
          if(result.length != 1) {
            logger.logMessage('result.length is not 1',2);
            callback(0);
            return;
          }
          conn.query('update problem_stats set '+msg+'_count='+mysql.escape(result[0][msg+'_count']+1)+' where problem_id='+mysql.escape(problem_id),
          function(err4) {
            if(err4) {
              logger.logException(err4,2);
            }
            callback(err4);
          });
        });
      });
    });
  },
  //function updateJudgeResult: Updates memory, time usage
  //callback: function(err, rows)
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
    pool.getConnection(function(err,conn) {
      if(err) {
        logger.logException(err,2);
        callback(err,null);
        return;
      }
      conn.query('select submit_count from problems where id='+mysql.escape(problem_id),
      function(err2,result) {
        if(err2) {
          logger.logException(err2,2);
          callback(err2);
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
