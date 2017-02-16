window.onload = function() {
  $('.btn-typeEdit').click(function(e) {
    console.log(document.getElementById('td-title-'+e.target.dataset.id).innerText);
    console.log(document.getElementById('td-desc-'+e.target.dataset.id).innerText);
    document.getElementById('editDesc').value=document.getElementById('td-desc-'+e.target.dataset.id).innerText;
    document.getElementById('editTitle').value=document.getElementById('td-title-'+e.target.dataset.id).innerText;
    document.getElementById('editId').value=e.target.dataset.id;
    $("#editModal").modal();
  });
  $('#btn-addType').click(function(e) {
    var title=document.getElementById('addTitle').value;
    var desc =document.getElementById('addDesc').value;
    if(title.trim()==='') {
      $('#modaladd-title-empty').show();
      return;
    }
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'title',
      'value': title,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'desc',
      'value': desc,
      'type' : 'hidden'
    }));
    $.ajax({
       url: '/sudo/master/types/add',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      if(data.success===0) {
        alert(data.message);
      }
      else {
        location.reload();
      }
    }).fail(function(data) {
      alert('Failed');
    });
  });
  $('#btn-editType').click(function(e) {
    var title= document.getElementById('editTitle').value;
    var desc = document.getElementById('editDesc').value;
    var id   = document.getElementById('editId').value;
    if(title.trim()==='') {
      $('#modaladd-title-empty').show();
      return;
    }
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'title',
      'value': title,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'desc',
      'value': desc,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'id',
      'value': id,
      'type' : 'hidden'
    }));
    $.ajax({
       url: '/sudo/master/types/edit',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      if(data.success===0) {
        alert(data.message);
      }
      else {
        location.reload();
      }
    }).fail(function(data) {
      alert('Failed');
    });
  });
  $('.btn-typeDelete').click(function(e) {
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'id',
      'value': e.target.dataset.id,
      'type' : 'hidden'
    }));
    $.ajax({
       url: '/sudo/master/types/delete',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      if(data.success===0) {
        alert(data.message);
      }
      else {
        location.reload();
      }
    }).fail(function(data) {
      alert('Failed');
    });
  });
};
