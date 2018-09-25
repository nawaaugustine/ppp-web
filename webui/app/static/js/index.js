/*This file contains front-end application logic*/

var default_language = '';
// file select onchange event handler
function handleFileSelect(evt) {
  var file = evt.target.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = e.target.result;
    var workbook = XLSX.read(data, {
      type: 'binary'
    });
    workbook.SheetNames.forEach(function(sheetName) {
      var XL_row_object = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (sheetName == 'choices') {
        $('#lang-picker').find('option').remove();
        const keys = Object.keys(XL_row_object[0]);
        keys.forEach(key => {
          if (key.startsWith('label::')) {
            const l = key.substr(7);
            $('#lang-picker').append(new Option(l, l.toLowerCase()));
            $('#lang-wrapper').show();
          }
        });
      }
      if (sheetName == 'settings') {
        default_language = XL_row_object[0].default_language;
      }
    });
    $('#lang-picker').val(default_language.toLowerCase());
  };
  reader.onerror = function(ex) {
    console.log('Exception: ', ex);
  };
  reader.readAsBinaryString(file);
}

// function unchecks all checkboxes on the page
function clearOptions() {
    $("input[type='checkbox']").attr("checked", false);
}

// function checks input (radio button or checkbox) by value
function setOption(value) {
    var selector = "input[value='" + value + "']";
    $(selector).prop('checked', true);
}

// add function, which will be ran when page is loaded. It will bootstrap
// page elements with events handlers
$(document).ready(function () {
    /* add submit button click event handler */
    $("#btnSubmit").click(function (event) {
        // if user has not selected a file
        if (!$("#inFile").val()) {
            // stop submitting form
            event.preventDefault();
            // show notification and exit handler
            return $.notify({
                message: 'Please, select file for uploading',
            }, {
                element: '.file-input',
                type: 'danger',
            });
            
            /* $(".file-input").notify("Please, select file for uploading", {
                clickToHide: false,
                position: ($(window).width() < 992) ? "bottom right" : "right",
                className: "error",
                autoHideDelay: 2000
            }) */
        }
        // disable submit button after 100 ms. to give form a chance to send
        // data to server
        setTimeout(function () {
            $(event.target).prop("disabled", true);
        }, 100);

        // clear the form after 3 seconds
        setTimeout(function () {
            // enable submit button
            $(event.target).prop("disabled", false);
            
            // set default output format
            // $("#btnHtmlFormat").click();
            $("#btnDocFormat").click();
            
            // set default preset
            $("#btnDevPreset").click();
            
            // reset the form fields. here ".get(0)" will return a plain
            // javascript dom object instead of jquery object
            $("#form").get(0).reset();
        }, 3000)

    });

    /* preset button click event handler */
    $("#presets").find("label").click(function (event) {
        // get input element in clicked label
        var $e = $(event.target).find("input");
        // do nothing if custom button is clicked
        if ($e.val() === 'custom') {
            return;
        }
        // clear existing options
        clearOptions();

        // enable options according to clicked preset
        switch ($e.val()) {
            case 'developer':
                break;
            case 'internal':
                setOption("hr-relevant");
                setOption("text-replacements");
                break;
            case 'public':
                setOption("input-replacement");
                setOption("exclusion");
                setOption("hr-relevant");
                setOption("hr-constraint");
                setOption("text-replacements");
                break
        }
    });

    /* options checkbox click event handler */
    $("input[type='checkbox']").click(function (event) {
        // if any option is selected by user? automatically assume
        // that preset is "custom"
        $("#btnCustomPreset").click();
    });

    // when all the handlers configured, check if hidden container
    // contains a server message, and if contains, show it to user
    var $message = $("#message");
    var text = $message.text().trim();

    var notify_classes;
    if ($message.data("category") == null) notify_classes = ['error', 'wrap-spaces'];
    else notify_classes = [$message.data("category"), 'wrap-spaces'];

    if (text !== '') {
        $("#btnSubmit").notify(text, {
            clickToHide: false,
            arrowShow: false,
            position: "bottom left",
            className: notify_classes,
            autoHide: false,
            button: 'X'
        });
    }
    
    // file input control change event handler
    document.getElementById('inFile').addEventListener('change', handleFileSelect, false);
});
