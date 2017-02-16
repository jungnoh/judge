window.onload = function() {
  $('#btn-prevpage').click(function(e) {
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['page']=(page===1?1:page-1);
    window.location.href='/problems?'+$.param(res);
  });
  $('#btn-nextpage').click(function(e) {
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['page']=page+1;
    window.location.href='/problems?'+$.param(res);
  });
  $('.item-types').click(function(e) {
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['type']=e.target.dataset.type;
    window.location.href='/problems?'+$.param(res);
  });
}
