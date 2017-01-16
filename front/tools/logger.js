module.exports = {
  logMessage: function(msg,errorLevel) {
    if(errorLevel==0) console.log('[LOG ]'+msg);
    else if(errorLevel==1) console.log('[WARN]'+msg);
    else console.log('[ERR ]'+msg);
  },
  logException: function(err,errorLevel) {
    if(errorLevel==0) console.log('[LOG ]'+err);
    else if(errorLevel==1) console.log('[WARN]'+err);
    else console.log('[ERR ]'+err);
    console.log(new Error().stack);
  }
}
