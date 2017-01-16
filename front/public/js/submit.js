window.onload = function() {
  var editor = ace.edit("div-editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
  editor.getSession().on('change', function(e) {
    document.getElementById('code-count').innerHTML = editor.getValue().length+' characters, '+editor.session.getLength()+' lines of code';
  });
  editor.getSession().selection.on('changeCursor', function(e) {
    var cursor = editor.selection.getCursor();
    //alert(JSON.stringify(editor.selection.getCursor()));
    document.getElementById('cursor-loc').innerHTML = "Line "+(cursor.row+1)+", Column "+cursor.column;
  });
};
