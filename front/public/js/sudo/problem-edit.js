window.onload = function() {
  CKEDITOR.replace('descEditor');
  CKEDITOR.replace('inputEditor');
  CKEDITOR.replace('outputEditor');
  $('#btn-submit').click(function(e) {
    /*
    singleQuery('UPDATE `problems` SET `title` = '+mysql.escape(data.title)
    +', `description` = '+mysql.escape(data.description)
    +', `input_desc` = '+mysql.escape(data.input_desc)
    +', `output_desc` = '+mysql.escape(data.output_desc)
    +', `hint` = '+mysql.escape(data.hint)
    +', `time_limit` = '+mysql.escape(data.time_limit)
    +', `memory_limit` = '+mysql.escape(data.memory_limit)
    +', `sample_input` = '+mysql.escape(data.sample_input)
    +', `sample_output` = '+mysql.escape(data.sample_output)+' WHERE `problems`.`id` = '+id,
    */
    var title         = document.getElementById('input-title').value,
        time          = document.getElementById('input-time').value,
        memory        = document.getElementById('input-memory').value,
        source        = document.getElementById('input-source').value,
        sample_input  = document.getElementById('input-sample-in').value,
        sample_output = document.getElementById('input-sample-out').value,
        desc          = CKEDITOR.instances['editor-desc'].document.getBody().getHtml(),
        input         = CKEDITOR.instances['editor-input'].document.getBody().getHtml(),
        output        = CKEDITOR.instances['editor-output'].document.getBody().getHtml();
    var newForm = $('<form>', {}).append($('<input>', {
      'name' : 'time_limit',
      'value': time,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'memory_limit',
      'value': memory,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'title',
      'value': title,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'source',
      'value': source,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'sample_input',
      'value': sample_input,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'sample_output',
      'value': sample_output,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'description',
      'value': desc,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'input_desc',
      'value': input,
      'type' : 'hidden'
    })).append($('<input>', {
      'name' : 'output_desc',
      'value': output,
      'type' : 'hidden'
    }));
    $.ajax({
       url: '/sudo/problems/'+problem+'/update',
       type: 'POST',
       data: $(newForm).serialize()
    }).done(function(data) {
      if(data.success===0) {
        alert(JSON.stringify(data));
        alert(data.message);
      }
      else {
        alert('Edit success');
        window.location.href = '/sudo/problems/';
      }
    }).fail(function(data) {
      alert('Failed');
    });
  });
  $('#btn-return').click(function(e) {
    location.href='/sudo/problems';
  });_
};
