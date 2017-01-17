window.onload = function() {
  document.getElementById('btn-signup').onclick = function() {
    window.location.href = 'signup';
  };
  document.getElementById('btn-iforgot').onclick = function() {
    window.location.href = 'iforgot';
  };
  $('#form-login').on('submit', function(e) {
    e.preventDefault();
    if(document.getElementById('input-id').value=='') {
      notifyIDEmpty();
      return;
    }
    if(document.getElementById('input-pw').value=='') {
      notifyPWEmpty();
      return;
    }
    $.ajax({
       type: "POST",
       url: "/auth/login",
       data: $('#form-login').serialize(),
    }).done(function(data) {
      if(data.success==0) {
        alert(data.message);
      }
      else {
        window.location.href = '/';
      }
    }).fail(function(data) {
      alert('login failed, consult admin');
    });
  });
}
function notifyIDEmpty() {
  alert('ID is empty!');
}
function notifyPWEmpty() {
  alert('Password is empty!');
}
