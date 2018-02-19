const electron = require('electron');
const dialog = require('electron').remote.dialog
const fs = require('fs');
const requirePath = require('path');

var openedFile = document.getElementById('openFileBtn');
var editor = document.getElementById('editor');
var saveFileBtn = document.getElementById('saveFileBtn');
var closeFileBtn = document.getElementById('closeFileBtn');
var saveFileAsBtn = document.getElementById('saveFileAsBtn');
var path = '';
var fileContents = '';
var currentFileName = '';
var pathSeperator = requirePath.sep;

var openFile = function() {
    dialog.showOpenDialog((fileNames) => {
        path = fileNames[0];
        currentFileName = fileNames[0].substring(fileNames[0].lastIndexOf(pathSeperator) + 1, fileNames[0].length);

        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }

            //Checks to see what type of file is opened
            var pathLength = path.length;
            var jsCheck = path.slice(pathLength - 3);
            var cssCheck = path.slice(pathLength - 4);
            var htmlCheck = path.slice(pathLength - 5);

            if (jsCheck == '.js') {
                enable_javascript();
                console.log('This is a .js file!');
            }

            if (cssCheck == '.css') {
                enable_css();
                console.log('This is a .css file!');
            }

            if (htmlCheck == '.html') {
                enable_html();
                console.log('This is a .html file!');
            }

            fileContents = data;
            // Show the text in ace editor. -1 specifies that cursor is at beginning of file.
            editor.setValue(data, -1);

            // Show the close file button
            closeFileBtn.classList.remove("hidden");

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
};

var saveFile = function() {
    if (path) {
        fs.writeFile(path, editor.getValue(), function(err) {
            if (err) {
                alert("An error ocurred updating the file" + err.message);
                console.log(err);
                return;
            }
            alert("The file has been succesfully saved");
        });
    } else {
        saveFileAs();
    }
};

var saveFileAs = function() {
    dialog.showSaveDialog(function(filename) {
        fs.writeFile(filename, editor.getValue(), function(err) {
            if (err) {
                alert("An error ocurred updating the file" + err.message);
                console.log(err);
                return;
            }
            alert("The file has been succesfully saved");
        });
        path = filename;
    });
};

var closeFile = function() {
    editor.setValue('', -1);
    closeFileBtn.classList.add("hidden");
    path = '';
};

openFileBtn.addEventListener('click', openFile);

saveFileBtn.addEventListener('click', saveFile);

closeFileBtn.addEventListener('click', closeFile);

saveFileAsBtn.addEventListener('click', saveFileAs);