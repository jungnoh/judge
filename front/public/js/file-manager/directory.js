function childDropDown(child) {

}
var children = document.getElementsByClassName('child-action');
for (var i = 0; i < children.length; i++) {
    childDropDown(children[i]);
}
var uploading=false;
window.onload = function() {
  $('#upload-file').click(function(e){
    if(!uploading) document.getElementById('upload-selector').click();
  });
  $('#upload-selector').change(function(e) {
    uploading = true;
    e.preventDefault();
    document.getElementById('upload-file').innerHTML='uploading..';
    $('#uploadForm').ajaxSubmit({
      error: function(xhr) {
        uploading=false;
        document.getElementById('upload-file').innerHTML='upload file';
        alert('Error: ' + xhr.status);
      },
      success: function(response) {
        uploading=false;
        document.getElementById('upload-file').innerHTML='upload file';
        alert(response);
        location.reload();
      }
    });
  });
};
