const electron = require('electron');
const dialog = require('electron').remote.dialog
const fs = require('fs');

var openedFile = document.getElementById('openFileBtn');
var editor = document.getElementById('temptextarea');
var saveFileBtn = document.getElementById('saveFileBtn');
var path = '';
var fileContents = '';
var currentFileName = '';

// openedFile.onchange = function() {
openFileBtn.addEventListener('click', function() {
    dialog.showOpenDialog((fileNames) => {
        path = fileNames[0];
        currentFileName = fileNames[0].substring(fileNames[0].lastIndexOf("\\") + 1, fileNames[0].length);
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }

            // show the text in the editor
            fileContents = data;
            console.log(fileContents);
            editor.textContent = data;

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
                        'fileContents': fileContents
                    });
                    // add user to file's userList
                    newFile.child('userList').child(user.uid).set({ 'username': currentUserName });
                    // add fileID to user's fileList
                    userRef.child('fileList').child(newFile.key).set({ 'fileName': currentFileName });
                });
            }
        });
    });
});

saveFileBtn.addEventListener('click', function() {
    if (path) {
        fs.writeFile(path, editor.value, function(err) {
            if (err) {
                alert("An error ocurred updating the file" + err.message);
                console.log(err);
                return;
            }
            alert("The file has been succesfully saved");
        });
    } else {
        alert("Please select a file first");
    }
}, false);