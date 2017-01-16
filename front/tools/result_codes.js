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
module.exports = {
  intToString: function(value) {
    switch(value) {
      case 0:
        return 'que';
      case 1:
        return 'cmp';
      case 2:
        return 'jud';
      case 3:
        return 'ce';
      case 4:
        return 're';
      case 5:
        return 'me';
      case 6:
        return 'wa';
      case 7:
        return 'tle';
      case 8:
        return 'ole';
      case 9:
        return 'se';
      case 10:
        return 'ac';
    }
  },
  intToFullString: function(value) {
    switch(value) {
      case 0:
        return 'Queued';
      case 1:
        return 'Compiling';
      case 2:
        return 'Judging';
      case 3:
        return 'Compile Error';
      case 4:
        return 'Runtime Error';
      case 5:
        return 'Memory Exceeded';
      case 6:
        return 'Wrong Answer';
      case 7:
        return 'Time Limit Exceeded';
      case 8:
        return 'Output Limit Exceeded';
      case 9:
        return 'System Error';
      case 10:
        return 'Accepted';
    }
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
