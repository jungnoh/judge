var cprocess = require('child_process');
var fs=require('fs-extra');
var path=require('path');
var sql=require('./../sql');
var compile_info=require('./compile_info');
var result_codes=require('./../tools/result_codes');

var rootDir = path.resolve(__dirname,'./../..');
//callback: function(err)
module.exports = function(submitID,userID,callback) {
  sql.submitInfo(submitID,function(err,rows) {
    if(err) {
      console.error(err.stack);
      callback(err);
      return;
    }
    if(rows.length===0) {
      console.error('Could not find submit information where ID='+submitID);
      callback('Could not find submit information');
      return;
    }
    sql.appendSubmitCount(rows[0].problem_id,userID,function(err2) {
      if(err2) {
        console.error('Error while appending submit count');
        console.error(err2);
        callback(err2);
        return;
      }
      lang=rows[0].lang; problem=rows[0].problem_id;
      //Prepare judge directory
      if(!fs.existsSync(path.resolve(rootDir,'./judge_tmp/'+submitID))) {
        fs.mkdirSync(path.resolve(rootDir,'./judge_tmp/'+submitID),'0777');
      }
      fs.chmodSync(path.resolve(rootDir,'./judge_tmp/'+submitID),'0777');
      doCompile(submitID,lang,function(result) {
        if(result===0) {
          console.error('Compile failed: '+submitID);
          sql.updateCompileError(submitID,fs.readFileSync(path.resolve(rootDir,'./judge_tmp/'+submitID+'/compile_error.txt')),function(err3,result) {
            if(err3) {
              console.error(err3);
              callback(err3);
              return;
            }
            fs.removeSync(path.resolve(rootDir,'./judge_tmp/'+submitID));
            sql.updateJudgeResult(submitID,problem,3,function(err4) {
              if(err4) {
                console.error(err4);
                callback(err4);
                return;
              }
              sql.updateUserJudgeCount(userID,3,function(err5,result) {
                if(err5) {
                  console.error(err5);
                  callback(err5);
                  return;
                }
              });
            });
          });
        }
        else if(result===2) {
          console.error('Error while starting compile: '+submitID);
          sql.updateCompileError(submitID,'Error while starting compilation, consult admin',function(err3,result) {
            if(err3) {
              console.error(err3);
              callback(err3);
              return;
            }
            fs.removeSync(path.resolve(rootDir,'./judge_tmp/'+submitID));
            sql.updateJudgeResult(submitID,problem,3,function(err4) {
              if(err4) {
                console.error(err4);
                callback(err4);
                return;
              }
              sql.updateUserJudgeCount(userID,9,function(err5,result) {
                if(err5) {
                  console.error(err5);
                  callback(err5);
                  return;
                }
              });
            });
          });
        }
        else {
          sql.problemInfo(rows[0].problem_id,function(err5,result2) {
            if(err5) {
              console.error(err5);
              callback(err5);
              return;
            }
            if(result2.length !== 1) {
              console.error('result2 is not 1');
              callback('result2 is not 1');
              return;
            }
            judgeProblem(rows[0],userID,result2[0],1,0,0,function(err6) {
              if(err6) {
                console.error(err6);
                callback(err6);
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
}
function judgeProblem(submitInfo,userID,probInfo,caseNo,mem,time,callback) {
  console.log('['+submitInfo.submit_id+'] Testing '+caseNo);
  if(caseNo > probInfo.case_count) {
    console.log('['+submitInfo.submit_id+'] Judging Complete without errors');
    sql.updateJudgeResult(submitInfo.submit_id,probInfo.id,10,function(err) {
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
        //sql.updateUserSolvedCount(,probInfo.id)
        //function(userid,problemid,callback)
        sql.updateUserSolvedCount(userID,probInfo.id,function(err3,result) {
          if(err3) {
            console.error(err3);
            callback(err3);
            return;
          }
          sql.updateUserJudgeCount(userID,10,function(err4,result) {
            if(err4) {
              console.error(err4);
            }
            console.log('asdfasdf');
            callback(err4);
            return;
          });
        });
      });
    });
  }
  else {
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
        sql.updateJudgeResult(submitInfo.submit_id,probInfo.id,result_json.res,
          function(err) {
            if(err) {
              console.error(err);
              callback(err);
              return;
            }
            sql.updateUserJudgeCount(userID,result_json.res,function(err2,result) {
              if(err2) {
                console.error(err2);
                callback(err2);
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
        });
        return;
      }
      //Check if answer is correct
      var res=normalJudge(probInfo.id,caseNo,fs.readFileSync(path.resolve(rootDir,'./judge_tmp/'+submitInfo.submit_id+'/out.txt'),'utf8'));
      if(res===0) {
        console.log('Input '+caseNo+' wrong');
        //Result wrong, Set as WA
        sql.updateJudgeResult(submitInfo.submit_id,probInfo.id,6,function(err) {
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
    //Prepare compilation
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
