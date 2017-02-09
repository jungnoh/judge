window.onload = function() {
  var innerCode = "";
  for(var i=0;i<code.length;i++) {
    innerCode += code[i]+'\n';
  }
  document.getElementById("div-editor").innerHTML = innerCode;
  var editor = ace.edit("div-editor");
  editor.getSession().setMode(language);
  editor.setTheme("ace/theme/monokai");
};
