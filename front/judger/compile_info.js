var rootDir = __dirname+'/../..';
var languages = require('./../tools/languages');
module.exports = {
  validLanguage: function(lang) {
    return !(languages[lang]===undefined);
  },
  needsCompile: function(lang) {
    return languages[lang].compile;
  },
  getSourceName: function(lang) {
    return languages[lang].source_name;
  },
  getRunArgs: function(lang,submitID,mem,time) {
    //'-v='+rootDir+'/judge_tmp/'+submitID+':/judgeData'
    //{0} rootDir, {1} submitID, {2} mem, {3} time
    var args=[];
    var lang_args=JSON.parse(languages[lang].run_command);
    for(var i=0;i<lang_args.length;i++) {
      args.push(buildCommand(lang_args[i],rootDir,submitID,mem,time));
    }
    /*
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
    */
    //console.log(args);
    return args;
  },
  getCompileArgs: function(lang, submitID) {
    var args=[];
    var lang_args=JSON.parse(languages[lang].compile_command);
    //console.log(lang_args);
    for(var i=0;i<lang_args.length;i++) {
      args.push(buildCommand(lang_args[i],rootDir,submitID));
    }
    /*
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
    */
    return args;
  }
}
function buildCommand(string,rootDir,submitID,mem,time) {
  return string.replace('{0}',rootDir).replace('{1}',submitID).replace('{2}',mem).replace('{3}',time);
}
