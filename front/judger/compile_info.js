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
    //{0} rootDir, {1} submitID, {2} mem, {3} time
    var args=[];
    var lang_args=JSON.parse(languages[lang].run_command);
    for(var i=0;i<lang_args.length;i++) {
      args.push(buildCommand(lang_args[i],submitID,mem,time));
    }
    return args;
  },
  getCompileArgs: function(lang, submitID) {
    var args=[];
    var lang_args=JSON.parse(languages[lang].compile_command);
    //console.log(lang_args);
    for(var i=0;i<lang_args.length;i++) {
      args.push(buildCommand(lang_args[i],submitID));
    }
    return args;
  }
}
function buildCommand(string,submitID,mem,time) {
  return string.replace('{0}',rootDir).replace('{1}',submitID).replace('{2}',mem).replace('{3}',time);
}
