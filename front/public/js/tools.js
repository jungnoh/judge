//http://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}
