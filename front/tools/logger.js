module.exports = {
  logMessage: function(msg,errorLevel) {
    if(errorLevel===0) console.log('[LOG ]'+msg);
    else if(errorLevel===1) console.log('[WARN]'+msg);
    else console.log('[ERR ]'+msg);
  },
  logException: function(err,errorLevel) {
    logMessage(err,errorLevel);
    console.log(new Error().stack);
  }
}
