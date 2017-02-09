var cprocess     = require('child_process');
var fs           = require('fs-extra');
var path         = require('path');
var sql          = require('./../sql');
var compile_info = require('./compile_info');
var result_codes = require('./../tools/result_codes');
var winston      = require('winston');
var rootDir      = path.resolve(__dirname,'./../..');

//callback: function(err)
module.exports = function(submitID,userID,callback) {
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
      sql.appendSubmitCount(submitInfo.problem_id,userID,function(appendSubmitErr) {
        if(appendSubmitErr) {
          winston.warning('Error while appending submit count');
          winston.warning(appendSubmitErr);
          callback(appendSubmitErr);
          return;
        }
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
              fs.removeSync(path.resolve(rootDir,'./judge_tmp/'+submitID));
              sql.updateCompileError(submitID,errorMessage,function(updateCompileErr,updateCompileResult) {
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
              sql.updateCompileError(submitID,'Error while starting compile docker container, contact admin.',function(updateCompileErr,updateCompileResult) {
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
                  fs.removeSync(path.resolve(rootDir,'./judge_tmp/'+submitID));
                  callback(null);
                  return;
                });
              });
            }
          });
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
    cprocess.execFile('docker',compile_info.getRunArgs(submitInfo.lang,submitInfo.submit_id,probInfo.memory_limit,probInfo.time_limit), function(error,stdout,stderr) {
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
      var res=normalJudge(probInfo.id,caseNo,fs.readFileSync(path.resolve(rootDir,'./judge_tmp/'+submitInfo.submit_id+'/out.txt'),'utf8'));
      if(res===0) {
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
            callback(null);
            return;
          });
        });
      }
      //Result correct, moving to next case
      else judgeProblem(submitInfo,userID,probInfo,caseNo+1,mem,time,callback);
    });
  }
}
/*
function specialJudge(problemID, caseNo, result) {
} */
//returns 0 for incorrect, 1 for correct
function normalJudge(problemID, caseNo, result) {
  var ansLines=splitText(fs.readFileSync(path.resolve(rootDir,'./cases/'+problemID+'/'+caseNo+'.out'),'utf8'));
  var inpLines=splitText(result);
  var ansSorted=[],inpSorted=[],i=0,st='';
  for(i=0;i<ansLines.length;i++) {
    st=ansLines[i].trim();
    if(st.length!==0) {
      ansSorted.push(st);
    }
  }
  for(i=0;i<inpLines.length;i++) {
    st=inpLines[i].trim();
    if(st.length!==0) {
      inpSorted.push(st);
    }
  }
  //console.log(ansSorted); console.log(inpSorted);
  if(inpSorted.length!==ansSorted.length) {
    return 0;
  }
  //console.log('asdf');
  for(i=0;i<inpSorted.length;i++) {
    //console.log('>'+ansSorted[i]+' >'+inpSorted[i]);
    if(inpSorted[i]===ansSorted[i]) {
      continue;
    }
    return 0;
  }
  return 1;
}
function doCompile(submitID,lang,callback) {
  console.log('['+submitID+'] Compiling ');
  if(!compile_info.validLanguage(lang)) {
    callback(2);
    return;
  }
  else if(compile_info.needsCompile(lang)) {
    fs.copySync(path.resolve(rootDir+'/usercode/'+submitID),path.resolve(rootDir+'/judge_tmp/'+submitID+'/'+compile_info.getSourceName(lang)));
    cprocess.execFile('docker',compile_info.getCompileArgs(lang,submitID), function(error,stdout,stderr) {
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
