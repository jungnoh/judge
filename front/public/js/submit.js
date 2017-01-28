window.onload = function() {
  var editor = ace.edit("div-editor");
  editor.setTheme("ace/theme/monokai");
  var mySelect = document.getElementById('select-lang');
  editor.getSession().setMode(mySelect.options[mySelect.selectedIndex].dataset.acelang);
  editor.getSession().on('change', function(e) {
    document.getElementById('code-count').innerHTML = editor.getValue().length+' '+charText+', '+editor.session.getLength()+' '+locText;
  });
  editor.getSession().selection.on('changeCursor', function(e) {
    var cursor = editor.selection.getCursor();
    //alert(JSON.stringify(editor.selection.getCursor()));
    document.getElementById('cursor-loc').innerHTML = lineText+" "+(cursor.row+1)+", "+columnText+" "+cursor.column;
  });
  $('#select-lang').change(function(e) {
    editor.getSession().setMode(mySelect.options[mySelect.selectedIndex].dataset.acelang);
  });
  $('#btn-submit').click(function(e) {
    e.preventDefault();
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'code',
      'value': editor.getValue(),
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'lang',
      'value': mySelect.options[mySelect.selectedIndex].value,
      'type' : 'hidden'
    }));
    //jQuery('#myform').append(newForm);
    $.ajax({
       url: '/problems/'+probID+'/submit',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      if(data.success===0) {
        alert(JSON.stringify(data));
        alert(data.message);
      }
      else {
        window.location.href = '/result?id='+myid+'&problem='+probID;
      }
    }).fail(function(data) {
      alert('login failed, consult admin');
    });
  });
};
