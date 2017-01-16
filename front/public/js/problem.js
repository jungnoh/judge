window.onload = function() {
  var clipboard = new Clipboard(document.querySelectorAll('.btn-copy'));
  clipboard.on('success', function(e) {
      alert("Copied to Clipboard!");
  });
  clipboard.on('error', function(e) {
      alert("Something went wrong..");
  });
};
