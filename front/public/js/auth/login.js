window.onload = function() {
  document.getElementById('btn-signup').onclick = function() {
    window.location.href = 'signup';
  };
  document.getElementById('btn-iforgot').onclick = function() {
    window.location.href = 'iforgot';
  };
  document.getElementById('btn-login').onclick = function() {
    //login logic
    window.location.href = typeof returnUrl==='undefined'?'/':returnUrl;
  }
}
