window.onload = function() {
  document.getElementById('h-current-url').innerHTML = 'http://'+window.location.hostname+'/board/post/'+id;
  CKEDITOR.replace('commentAddEditor');
  CKEDITOR.instances['editor-comment-add'].config.toolbar = [
  	{ name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo' ] },
  	{ name: 'links', items: [ 'Link', 'Unlink'] },
  	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Strike', '-', 'RemoveFormat' ] },
  	{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote' ] },
  	{ name: 'styles', items: [ 'Styles', 'Format' ] }
  ];

  // Toolbar groups configuration.
  CKEDITOR.instances['editor-comment-add'].config.toolbarGroups = [
  	{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
  	{ name: 'links' },
  	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
  	{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
  	{ name: 'styles' },
  	{ name: 'colors' }
  ];
  //CKEDITOR.instances['editor-comment-add'].config.removePlugins='image,wsc,scayt,undo,about,pastetext,pastefromword,maximize,magicline,sourcearea,clipboard';
  $('#btn-prevcomment').click(function(e) {
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['page']=(page===1?1:page-1);
    window.location.href='/board?'+$.param(res);
  });
  $('#btn-nextcomment').click(function(e) {
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['page']=page+1;
    window.location.href='/board?'+$.param(res);
  });
  $('.item-types').click(function(e) {
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['type']=e.target.dataset.type;
    window.location.href='/board?'+$.param(res);
  });
  $('#btn-erase').click(function(e) {
    if(confirm('정말로 댓글 내용을 지우시겠습니까?')!=0) {
      CKEDITOR.instances['editor-comment-add'].setData('');
    }
  });
  $('#btn-submit').click(function(e) {
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'content',
      'value': CKEDITOR.instances['editor-comment-add'].document.getBody().getHtml(),
      'type' : 'hidden'
    }));
    $.ajax({
       url: '/board/post/'+id+'/comment',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      window.location.href = '/board/post/'+id;
    }).fail(function(data) {
      alert(data);
    });
  });
  $('#btn-delete-post').click(function(e) {
    $.ajax({
      url: '/board/post/'+id+'/delete',
      type: 'PUT'
    }).done(function(data) {
      window.location.href = '/board';
    }).fail(function(data) {
      alert(data);
    });
  });
}
