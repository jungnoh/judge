window.onload = function() {
  $('#btn-submit').click(function(e) {
    clearText();
    if(!document.getElementById('input-tos-agree').checked) {
      notifyField('p-error-tos','You must agree to the Terms of Service.');
      return;
    }
    var id       = document.getElementById('input-id').value,
        pw       = document.getElementById('input-pw').value,
        pwagain  = document.getElementById('input-pwagain').value,
        email    = document.getElementById('input-email').value,
        nickname = document.getElementById('input-nickname').value,
        org      = document.getElementById('input-org').value;
    var hasProblems = false;
    id=id.trim();
    email=email.trim();
    nickname=nickname.trim();
    org=org.trim();
    if(id==='') {
      hasProblems = true;
      notifyFieldEmpty('p-error-id');
    }
    if(pw==='') {
      hasProblems = true;
      notifyFieldEmpty('p-error-pw');
    }
    if(pwagain==='') {
      hasProblems = true;
      notifyFieldEmpty('p-error-pwagain');
    }
    if(email==='') {
      hasProblems = true;
      notifyFieldEmpty('p-error-email');
    }
    if(hasProblems) {
      return;
    }
    if(pw.length<8) {
      notifyField('p-error-pw','Password is too short');
      return;
    }
    if(pw!==pwagain) {
      notifyField('p-error-pw','Passwords do not match');
      notifyField('p-error-pwagain','Passwords do not match');
      return;
    }
    if(id.length>20) {
      notifyField('p-error-id','ID is too long');
      return;
    }
    if(/[^a-zA-Z0-9]/.test(id)) {
      notifyField('p-error-id','ID contains invalid characters.');
      return;
    }
    if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
      notifyField('p-error-email','Invalid email address.');
      return;
    }
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'id',
      'value': id,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'pw',
      'value': pw,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'email',
      'value': email,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'nickname',
      'value': nickname===''?id:nickname,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'org',
      'value': org,
      'type' : 'hidden'
    }));
    $.ajax({
       url: '/auth/signup',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      if(data.success===0) {
        alert(data.message);
      }
      else {
        alert('Signup complete, login with your credentials.');
        window.location.href = '/';
      }
    }).fail(function(data) {
      alert('login failed, consult admin');
    });
  });
}
function notifyFieldEmpty(id) {
  var elem = document.getElementById(id);
  elem.innerHTML = 'This field is mandatory.';
  elem.style.display = 'inline';
}
function notifyField(id, value) {
  var elem = document.getElementById(id);
  elem.innerHTML = value;
  elem.style.display = 'inline';
}
function clearText() {
  document.getElementById('p-error-tos').style.display     = 'none';
  document.getElementById('p-error-id').style.display      = 'none';
  document.getElementById('p-error-pw').style.display      = 'none';
  document.getElementById('p-error-pwagain').style.display = 'none';
  document.getElementById('p-error-email').style.display   = 'none';
}
