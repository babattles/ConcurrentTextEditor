const electron = require('electron');
const dialog = require('electron').remote.dialog

var PythonShell = require('python-shell');
var openedFile = document.getElementById('openedFile');
var editor = document.getElementById('temptextarea');
var saveFileBtn = document.getElementById('saveFileBtn');
var path = '';

openedFile.onchange = function() {
    // TODO this may not work correctly if multiple files are opened.(ie ones is opened, closed and then another one is opened.)
    var file = document.getElementById('openedFile').files[0];
    var path = file.path;

    var currentFileName = file.name;
    var currentUserName = '';

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

        // Add file to user's account
        var user = firebase.auth().currentUser;
        if (user) {
            // user is logged in
            var userRef = firebase.database().ref().child("users").child(user.uid);
            // get the user's username
            userRef.child("username").once("value").then(function(snapshot) {
                currentUserName = snapshot.val();
                var fileList = firebase.database().ref().child('files');
                var newFile = fileList.push(); // generate a new fileID
                newFile.set({
                    'fileName': currentFileName,
                    'fileContents': fileContents,
                });
                // add user to file's userList
                newFile.child('userList').child(user.uid).set({'username' : currentUserName});
                // add fileID to user's fileList
                userRef.child('fileList').child(newFile.key).set({'fileName' : currentFileName});
            });
        }

        // show the text in the editor
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