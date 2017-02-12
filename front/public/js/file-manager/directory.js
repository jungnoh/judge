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
        location.reload();
      }
    });
  });
  $(function() {
      $.contextMenu({
          selector: '.right-menu-child',
          callback: function(key, options) {
            if(key==='edit') {
              location.href=options.$trigger[0].dataset["editurl"];
            } else if(key=='download') {
              location.href=options.$trigger[0].dataset["downloadurl"];
            } else if(key=='delete') {
              $.ajax(
                { url: options.$trigger[0].dataset["deleteurl"],
                  success: function(result){
                    location.reload();
                  },
                  error: function(result) {
                    alert(result);
                  }
                });
            }
          },
          items: {
              "edit": {name: "Edit", icon: "edit"},
              "download": {name: "Download", icon: "copy"},
              "sep1": "---------",
              "delete": {name: "Delete", icon: "delete"}
          }
      });
  });
  $(function() {
      $.contextMenu({
          selector: 'body',
          callback: function(key, options) {
            if(key==='mkdir') {
              var name = prompt("Enter new folder name", "");
              var url = location.href.replace(/\/browse/,'/mkdir');
              if(url[url.length-1]!=='/') url=url+'/';
              url=url+name;
              $.ajax(
                { url: url,
                success: function(result) {
                  location.reload();
                },
                error: function(result) {
                  alert(JSON.stringify(result));
                }
              });
            } else if(key=='new') {
              document.getElementById('new-file').click();
            } else {
              document.getElementById('upload-file').click();
            }
          },
          items: {
              "mkdir": {name: "New Folder", icon: "add"},
              "new": {name: "New File", icon: "copy"},
              "upload": {name: "Upload Files", icon: "paste"}
          }
      });

      $('.context-menu-one').on('click', function(e){
          alert(JSON.stringify(e));
          console.log('clicked', this);
      })
  });
};
