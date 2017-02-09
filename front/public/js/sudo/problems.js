window.onload = function() {
  $('#btn-prevpage').click(function(e) {
    //var newUrl = location.href.replace("page="+page, "page="+(page-1));
    //alert(newUrl);
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['page']=(page===1?1:page-1);
    console.log(res);
    window.location.href='/sudo/problems?'+$.param(res);
  });
  $('#btn-nextpage').click(function(e) {
    //var newUrl = location.href.replace("page="+page, "page="+(page-1));
    //alert(newUrl);
    var search = location.search.substring(1);
    var res = {};
    if(search!=='') {
      res = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    res['page']=page+1;
    console.log(res);
    window.location.href='/sudo/problems?'+$.param(res);
  });
}
