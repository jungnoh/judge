window.onload = function() {
  $('#btn-write').click(function(e) {
    //onclick="document.location.href='<%='/board/write'+(subject==undefined?'':('?subject='+subject))%>'"
    var res = {};
    if(subject!=undefined) res['subject']=subject;
    if(subjectProblem!=undefined) res['subjectProblem']=subjectProblem;
    document.location.href='/board/write?'+$.param(res);
  });
  $('#btn-prevpage').click(function(e) {
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['page']=(page===1?1:page-1);
    window.location.href='/board?'+$.param(res);
  });
  $('#btn-nextpage').click(function(e) {
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
}
