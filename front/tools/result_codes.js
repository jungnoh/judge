/*
enum resultValues {
    QUE = 0,  // Queued
    CMP = 1,  // Compiling
    JUD = 2,  // Judging
    CE = 3,   // Compile Error
    RE = 4,   // Runtime Error
    ME = 5,   // Memory Exceeded
    WA = 6,   // Wrong Answer
    TLE = 7,  // Time Limit Exceeded
    OLE = 8,  // Output Limit Exceeded
    SE = 9,   // System Error (IO, ..)
    AC = 10   // Accepted
};
*/
var valueString=['Queued','Compiling','Judging','Compile Error','Runtime Error','Memory Exceeded','Wrong Answer','Time Limit Exceeded','Output Limit Exceeded','System Error','Accepted'],
    valueInt=['que','cmp','jud','ce','re','me','wa','tle','ole','se','ac'];

module.exports = {
  intToString: function(value) {
    if(val<0||val>10) return null;
    return valueInt[value];
  },
  intToFullString: function(value) {
    if(val<0||val>10) return null;
    return valueString[value];
  },
  stringToInt: function(value) {
    switch(value) {
      case 'QUE':
        return 0;
      case 'CMP':
        return 1;
      case 'JUD':
        return 2;
      case 'CE':
        return 3;
      case 'RE':
        return 4;
      case 'ME':
        return 5;
      case 'WA':
        return 6;
      case 'TLE':
        return 7;
      case 'OLE':
        return 8;
      case 'SE':
        return 9;
      case 'AC':
        return 10;
      default:
        return -1;
    }
  }
};
