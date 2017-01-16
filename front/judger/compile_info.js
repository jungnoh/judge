var rootDir = __dirname+'/../..';
module.exports = {
  validLanguage: function(lang) {
    switch(lang) {
      case 'cpp':
      case 'cpp11':
      case 'cpp14':
      case 'c99':
        return true;
      default:
        return false;
    }
  },
  needsCompile: function(lang) {
    switch(lang) {
      case 'cpp':
      case 'cpp11':
      case 'cpp14':
      case 'c99':
        return true;
    }
  },
  getSourceFileName: function(lang) {
    switch(lang) {
      case 'cpp':
      case 'cpp11':
      case 'cpp14':
        return 'source.cpp';
      case 'c99':
        return 'source.c';
    }
  },
  getRunArgs: function(lang,submitID,mem,time) {
    var args=[];
    switch(lang) {
      case 'cpp':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','cpprun','/workspace/runner',mem,time,'-m'];
        break;
      case 'cpp11':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','cpp11run','/workspace/runner',mem,time,'-m'];
        break;
      case 'cpp14':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','cpp14run','/workspace/runner',mem,time,'-m'];
        break;
      case 'c99':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','c99run','/workspace/runner',mem,time,'-m'];
        break;
    }
    return args;
  },
  getCompileArgs: function(lang, submitID) {
    var args=[];
    switch(lang) {
      case 'cpp':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','cppbuild','/workspace/runner'];
        break;
      case 'cpp11':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','cpp11build','/workspace/runner'];
        break;
      case 'cpp14':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','cpp14build','/workspace/runner'];
        break;
      case 'c99':
        args = ['run','-m=2G','--network=none','-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData','c99build','/workspace/runner'];
        break;
    }
    return args;
  }
}
