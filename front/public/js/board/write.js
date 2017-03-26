window.onload = function() {
  CKEDITOR.replace('contentEditor');
  CKEDITOR.instances['editor-content'].config.removePlugins='about';
  $('#btn-submit').click(function(e) {
    var mySelect = document.getElementById('select-subject');
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'content',
      'value': CKEDITOR.instances['editor-content'].document.getBody().getHtml(),
      'type' : 'hidden'
    }))
    .append($('<input>', {
      'name' : 'title',
      'value': document.getElementById('input-title').value,
      'type' : 'hidden'
    }));
    if(problemBoard==1) {
      newForm.append($('<input>', {
        'name' : 'subject',
        'value': 'qna',
        'type' : 'hidden'
      })).append($('<input>', {
        'name' : 'subjectProblem',
        'value': subjectProblem,
        'type' : 'hidden'
      }));
    }
    else newForm.append($('<input>', {
      'name' : 'subject',
      'value': mySelect.options[mySelect.selectedIndex].value,
      'type' : 'hidden'
    }));
    $.ajax({
       url: '/board/post/write',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      window.location.href = '/board/post/'+data;
    }).fail(function(data) {
      alert(data);
    });
  });
}
