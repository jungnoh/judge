var cprocess     = require('child_process');
var fs           = require('fs-extra');
var path         = require('path');
var sql          = require('./../sql');
var compile_info = require('./compile_info');
var result_codes = require('./../tools/result_codes');
var winston      = require('winston');
var rootDir      = path.resolve(__dirname,'./../..');
var kue          = require('kue');

var judgeQueue = kue.createQueue();
var langList={};
judgeQueue.process('judge', 4, function(job, done){
  sql.getLanguages(function(err,result) {
    if(err) {
      console.error('Failed to get languages');
      console.error(err)
    }
    for(var i=0;i<result.length;i++) {
      langList[result[i].codename]=result[i];
    }
    startJudge(job.data.submitID,job.data.userID,done);
  });
});

module.exports = function(submitID,userID,callback) {
  var job = judgeQueue.create('judge',{'submitID': submitID, 'userID': userID}).save();
  job.on('complete', function(result) {
    console.log('Job completed with data ', result);
  }).on('failed attempt', function(errorMessage, doneAttempts){
    console.log('Job failed');
  }).on('failed', function(errorMessage){
    console.log('Job failed');
  }).on('progress', function(progress, data){
    console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
  });
};
var startJudge = function(submitID,userID,callback) {
  //Fetch Problem, Submit Information
  sql.submitInfo(submitID,function(submitInfoErr,submitResult) {
    if(submitInfoErr) {
      winston.warning(submitInfoErr);
      callback(submitInfoErr);
      return;
    }
    var submitInfo = submitResult[0];
    sql.problemInfo(submitInfo.problem_id,function(problemInfoErr,problemResult) {
      if(problemInfoErr) {
        winston.warning(problemInfoErr);
        callback(problemInfoErr);
        return;
      }
      var problemInfo = problemResult[0];
      if(!fs.existsSync(path.resolve(rootDir,'./judge_tmp/'+submitID))) {
        fs.mkdirSync(path.resolve(rootDir,'./judge_tmp/'+submitID),'0777');
      }
      fs.chmodSync(path.resolve(rootDir,'./judge_tmp/'+submitID),'0777');
      sql.updateJudgeResult(submitID,problemInfo.problem_id,userID,1,function(updateCompileErr) {
        if(updateCompileErr) {
          console.log(updateCompileErr);
          callback(updateCompileErr);
          return;
        }
        doCompile(submitID,submitInfo.lang,function(compileResult) {
          if(compileResult===0) {
            winston.info('['+submitID+'] Compile Failed');
            var errorMessage=fs.readFileSync(path.resolve(rootDir,'./judge_tmp/'+submitID+'/compile_error.txt'));
            //fs.removeSync(path.resolve(rootDir,'./judge_tmp/'+submitID));
            sql.updateJudgeError(submitID,errorMessage,function(updateCompileErr,updateCompileResult) {
              if(updateCompileErr) {
                winston.info(updateCompileErr);
                callback(updateCompileErr);
                return;
              }
              sql.updateJudgeResult(submitID,problemInfo.problem_id,userID,3,function(updateJudgeErr) {
                if(updateJudgeErr) {
                  winston.info(updateJudgeErr);
                  callback(updateJudgeErr);
                  return;
                }
                callback(null);
                return;
              });
            });
          }
          else if(compileResult===2) {
            winston.error('['+submitID+'] Error while starting compile docker container');
            sql.updateJudgeError(submitID,'Error while starting compile docker container, contact admin.',function(updateCompileErr,updateCompileResult) {
              if(updateCompileErr) {
                winston.info(updateCompileErr);
                callback(updateCompileErr);
                return;
              }
              sql.updateJudgeResult(submitID,problemInfo.problem_id,userID,9,function(updateJudgeError) {
                if(updateJudgeErr) {
                  winston.info(updateJudgeErr);
                  callback(updateJudgeErr);
                  return;
                }
                callback(null);
                return;
              });
            });
          }
          else {
            sql.updateJudgeResult(submitID,problemInfo.problem_id,userID,2,function(updateJudgeErr) {
              if(updateJudgeErr) {
                console.log(updateJudgeErr);
                callback(updateJudgeErr);
                return;
              }
              judgeProblem(submitInfo,userID,problemInfo,1,0,0,function(judgeErr) {
                if(judgeErr) {
                  winston.error(judgeErr);
                  callback(judgeErr);
                  return;
                }
                //fs.removeSync(path.resolve(rootDir,'./judge_tmp/'+submitID));
                callback(null);
                return;
              });
            });
          }
        });
      });
    });
  });
}
function judgeProblem(submitInfo,userID,probInfo,caseNo,mem,time,callback) {
  if(caseNo > probInfo.case_count) {
    console.log('['+submitInfo.submit_id+'] Judging Complete without errors');
    sql.updateJudgeResult(submitInfo.submit_id,probInfo.id,userID,10,function(err) {
      if(err) {
        console.error(err);
        callback(err);
        return;
      }
      sql.updateJudgeUsageResult(submitInfo.submit_id,time,mem,function(err2) {
        if(err2) {
          console.error(err2);
          callback(err2);
          return;
        }
        sql.updateUserSolvedCount(userID,probInfo.id,function(err3,result) {
          if(err3) {
            console.error(err3);
            callback(err3);
            return;
          }
          callback(null);
          return;
        });
      });
    });
  }
  else {
    console.log('['+submitInfo.submit_id+'] Testing '+caseNo);
    removeIfExist(path.resolve(rootDir,'./judge_tmp/'+submitInfo.submit_id+'/data.in'));
    removeIfExist(path.resolve(rootDir,'./judge_tmp/'+submitInfo.submit_id+'/out.txt'));
    removeIfExist(path.resolve(rootDir,'./judge_tmp/'+submitInfo.submit_id+'/error.txt'));
    removeIfExist(path.resolve(rootDir,'./judge_tmp/'+submitInfo.submit_id+'/result.json'));
    fs.copySync(path.resolve(rootDir+'/cases/'+probInfo.id+'/'+caseNo+'.in'),path.resolve(rootDir+'/judge_tmp/'+submitInfo.submit_id+'/data.in'));
    cprocess.execFile('docker',compile_info.getRunArgs(langList,submitInfo.lang,submitInfo.submit_id,probInfo.memory_limit,probInfo.time_limit), function(error,stdout,stderr) {
      console.log(stdout);
      console.error(stderr);
      var result_json=JSON.parse(fs.readFileSync(path.resolve(rootDir+'/judge_tmp/'+submitInfo.submit_id+'/result.json'),'utf8'));
      //Code ended properly, update memory, time usage
      if(mem<result_json.mem) mem=result_json.mem; if(time<result_json.time) time=result_json.time;
      if(result_json.res!==10) {
        sql.updateJudgeResult(submitInfo.submit_id,probInfo.id,userID,result_json.res,
          function(err) {
            if(err) {
              console.error(err);
              callback(err);
              return;
            }
            sql.updateJudgeUsageResult(submitInfo.submit_id,time,mem,function(err3) {
              if(err3) {
                console.error(err3);
                callback(err3);
                return;
              }
              callback();
            });
        });
        return;
      }
      //Check if answer is correct
      var res=normalJudge(probInfo.id,caseNo,submitInfo.submit_id,function(success,output) {
        if(success===0) {
          console.log('Input '+caseNo+' wrong');
          //Result wrong, Set as WA
          sql.updateJudgeResult(submitInfo.submit_id,probInfo.id,userID,6,function(err) {
            if(err) {
              console.error(err);
              callback(err);
              return;
            }
            sql.updateJudgeUsageResult(submitInfo.submit_id,time,mem,function(err2) {
              if(err2) {
                console.error(err2);
                callback(err2);
                return;
              }
              sql.updateJudgeError(submitInfo.submit_id,output,function(err3) {
                if(err3) {
                  console.error(err3);
                  callback(err3);
                  return;
                }
                callback(null);
                return;
              });
            });
          });
        }
        //Result correct, moving to next case
        else judgeProblem(submitInfo,userID,probInfo,caseNo+1,mem,time,callback);
      });
    });
  }
}
/*
function specialJudge(problemID, caseNo, result) {
} */
//returns 0 for incorrect, 1 for correct
function normalJudge(problemID, caseNo, submitID, callback) {
  //fs.readFileSync(path.resolve(rootDir,'./judge_tmp/'+submitInfo.submit_id
  //path.resolve(rootDir,'./cases/'+problemID+'/'+caseNo+'.out'),'utf8'))
  cprocess.execFile('diff',['-w',path.resolve(rootDir,'./judge_tmp/'+submitID+'/out.txt'),path.resolve(rootDir,'./cases/'+problemID+'/'+caseNo+'.out')], function(error,stdout,stderr) {
    if(error) callback(0,stdout);
    else callback(1,null);
  });
}
function doCompile(submitID,lang,callback) {
  console.log('['+submitID+'] Compiling ');
  if(!compile_info.validLanguage(langList,lang)) {
    callback(2);
    return;
  }
  else if(compile_info.needsCompile(langList,lang)) {
    fs.copySync(path.resolve(rootDir+'/usercode/'+submitID),path.resolve(rootDir+'/judge_tmp/'+submitID+'/'+compile_info.getSourceName(langList,lang)));
    cprocess.execFile('docker',compile_info.getCompileArgs(langList,lang,submitID), function(error,stdout,stderr) {
      console.log(stdout);
      console.error(stderr);
      if(error) {
        console.error("Error occured during compilation ("+submitID+"):");
        console.error(error.stack);
        callback(0);
        return;
      }
      else if(!fs.existsSync(path.resolve(rootDir+'/judge_tmp/'+submitID+'/compile_result.json'))) {
        console.error('Error while reading compile result: Usually the docker image is missing');
        callback(2);
        return;
      }
      else if(parseCompileResult(submitID)===0) {
        callback(0);
        return;
      }
      else {
        console.log(stdout);
        console.error(stderr);
        console.log("Compilation complete: "+submitID);
        callback(1);
        return;
      }
    });
  }
  else {
    callback(1);
    return;
  }
}
function parseCompileResult(submitID) {
  var json=fs.readFileSync(path.resolve(rootDir+'/judge_tmp/'+submitID+'/compile_result.json'),'utf8');
  return JSON.parse(json).res;
}
function splitText(text) {
  return text.split(/\r?\n/);
}
function removeIfExist(path) {
  if(fs.existsSync(path)) {
    fs.removeSync(path);
  }
}
