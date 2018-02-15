const electron = require('electron');
const dialog = require('electron').remote.dialog
var PythonShell = require('python-shell');
var openedFile = document.getElementById('openedFile');
var editor = document.getElementById('temptextarea');
var saveFileBtn = document.getElementById('saveFileBtn');
var path = '';

openedFile.onchange = function() {
    // TODO this may not work correctly if multiple files are opened.(ie ones is opened, closed and then another one is opened.)
    path = document.getElementById('openedFile').files[0].path;

    var options = {
        args: [path]
    };
    PythonShell.run('./app/python_scripts/openFile.py', options, function(err, results) {
        if (err) throw err;
        var fileContents = '';
        for (i = 0; i < results.length; i++) {
            fileContents += results[i];
        }
        fileContents = fileContents.substring(0, fileContents.length - 1);
        editor.textContent = fileContents;
    });
};

saveFileBtn.addEventListener('click', function() {
    if (path === '') {
        alert("You must open a file first.");
        return;
    }
    var options = {
        args: [path, editor.value]
    };
    PythonShell.run('./app/python_scripts/saveFile.py', options, function(err, results) {
        if (err) throw err;
    });
});