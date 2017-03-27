window.onload = function() {
  //50
  CKEDITOR.replace('contentEditor');
  CKEDITOR.instances['editor-content'].config.removePlugins='about';
  $('#btn-submit').click(function(e) {
    var mySelect = document.getElementById('select-subject'),
        title = document.getElementById('input-title').value,
        content = CKEDITOR.instances['editor-content'].document.getBody().getHtml();
    title = title.trim();
    if(title.length>50) {
      alert('제목이 너무 깁니다!');
      return;
    }
    if(title=='') {
      alert('제목이 비어있습니다!');
      return;
    }
    if(CKEDITOR.instances['editor-content'].document.getBody().getText().trim()=='') {
      alert('글내용이 비어있습니다!');
      return;
    }
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'content',
      'value': content,
      'type' : 'hidden'
    }))
    .append($('<input>', {
      'name' : 'title',
      'value': title,
      'type' : 'hidden'
    }));
    if(typeof problemBoard!='undefined'&&problemBoard==1) {
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
