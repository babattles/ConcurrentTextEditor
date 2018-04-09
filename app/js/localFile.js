const electron = require('electron');
const dialog = require('electron').remote.dialog
const fs = require('fs');
const requirePath = require('path');

var editor = document.getElementById('editor');
var path = '';
var fileContents = '';
var currentFileName = '';
var pathSeperator = requirePath.sep;
var currentFile;


var openFile = function () {
    dialog.showOpenDialog((fileNames) => {
        path = fileNames[0];
        currentFileName = fileNames[0].substring(fileNames[0].lastIndexOf(pathSeperator) + 1, fileNames[0].length);

        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }

            var modelist = ace.require("ace/ext/modelist");
            var mode = modelist.getModeForPath(path).mode;
            editor.getSession().setMode(mode);

            // set the state (so opening a file doesn't stage an edit)
            global_ignore = true;

            fileContents = data;
            // Show the text in ace editor. -1 specifies that cursor is at beginning of file.
            editor.setValue(data, -1);

            //Create a new tab for the file
            addTab(currentFileName);
            fileNum++;
            console.log("curr file number " + fileNum);

            // reset the state
            global_ignore = false;

            // enable the close menu option
            ipcRenderer.send('enable-close', 'ping');

            // Add file to user's account
            var user = firebase.auth().currentUser;
            if (user) {
                // user is logged in
                var userRef = firebase.database().ref().child("users").child(user.uid);
                // get the user's username
                userRef.child("username").once("value").then(function (snapshot) {
                    currentUserName = snapshot.val();
                    var fileList = firebase.database().ref().child('files');
                    var newFile = fileList.push(); // generate a new fileID
                    newFile.set({
                        'fileName': currentFileName,
                        'fileContents': fileContents
                    });
                    // set the current open file to the new file
                    currentFile = newFile;
                    // Set the default channels
                    currentFile.child("messages").child("General").once('value', function (snapshot) {
                        if (!snapshot.exists()) {
                            currentFile.child("messages").child("General").push({
                                content: "Welcome to the General Channel!",
                                user: "HiveText",
                            });
                        }
                    });
                    currentFile.child("messages").child("Random").once('value', function (snapshot) {
                        if (!snapshot.exists()) {
                            currentFile.child("messages").child("Random").push({
                                content: "Welcome to the Random Channel!",
                                user: "HiveText",
                            });
                        }
                    });
                    loadChannels();
                    // set the editRef
                    editRef = currentFile.child("edits");
                    // add user to file's userList
                    newFile.child('userList').child(user.uid).set({ 'username': currentUserName });
                    // add fileID to user's fileList
                    userRef.child('fileList').child(newFile.key).set({ 'fileName': currentFileName });
                    // set current user online status
                    newFile.child('userList').child(user.uid).child('online').set('true');
                });
            }
        });

        //Loads the edits for the file
        loadEdits();
    });
};

//open a file when dragged into ace
var openFileDrag = function (pathDrag) {
    path = pathDrag;
    currentFileName = path.substring(path.lastIndexOf(pathSeperator) + 1, path.length);;

    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            alert("An error ocurred reading the file :" + err.message);
            return;
        }

        var modelist = ace.require("ace/ext/modelist");
        var mode = modelist.getModeForPath(path).mode;
        editor.getSession().setMode(mode);

        // set the state (so opening a file doesn't stage an edit)
        global_ignore = true;

        fileContents = data;
        // Show the text in ace editor. -1 specifies that cursor is at beginning of file.
        editor.setValue(data, -1);

        //Create a new tab for the file
        addTab(currentFileName);
        fileNum++;

        // reset the state
        global_ignore = false;

        // enable the close menu option
        ipcRenderer.send('enable-close', 'ping');

        // Add file to user's account
        var user = firebase.auth().currentUser;
        if (user) {
            // user is logged in
            var userRef = firebase.database().ref().child("users").child(user.uid);
            // get the user's username
            userRef.child("username").once("value").then(function (snapshot) {
                currentUserName = snapshot.val();
                var fileList = firebase.database().ref().child('files');
                var newFile = fileList.push(); // generate a new fileID
                newFile.set({
                    'fileName': currentFileName,
                    'fileContents': fileContents
                });
                // set the current open file to the new file
                currentFile = newFile;
                // Set the default channels
                currentFile.child("messages").child("General").once('value', function (snapshot) {
                    if (!snapshot.exists()) {
                        currentFile.child("messages").child("General").push({
                            content: "Welcome to the General Channel!",
                            user: "HiveText",
                        });
                    }
                });
                currentFile.child("messages").child("Random").once('value', function (snapshot) {
                    if (!snapshot.exists()) {
                        currentFile.child("messages").child("Random").push({
                            content: "Welcome to the Random Channel!",
                            user: "HiveText",
                        });
                    }
                });
                loadChannels();
                // set the editRef
                editRef = currentFile.child("edits");
                // add user to file's userList
                newFile.child('userList').child(user.uid).set({ 'username': currentUserName });
                // add fileID to user's fileList
                userRef.child('fileList').child(newFile.key).set({ 'fileName': currentFileName });
                // set current user online status
                newFile.child('userList').child(user.uid).child('online').set('true');
            });
        }
    });
};

var saveFile = function () {
    if (path) {
        fs.writeFile(path, editor.getValue(), function (err) {
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

var saveFileAs = function () {
    dialog.showSaveDialog(function (filename) {
        fs.writeFile(filename, editor.getValue(), function (err) {
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

setCurrentFile = function (fileKey) {
    currentFile = fileKey;
}

var closeFile = function () {
    // set the state (so opening a file doesn't stage an edit)
    global_ignore = true;

    var onlineUsersContainer = document.getElementById("online-users");
    //Remove all users from GUI 
    while (onlineUsersContainer.firstChild) {
        onlineUsersContainer.removeChild(onlineUsersContainer.firstChild);
    }

    //Remove this tab
    closeTab();
    fileNum--;
    path = '';
    currentKey = '';
    var user = firebase.auth().currentUser;
    if (user) {
        currentFile.child('userList').child(user.uid).child('online').set('false');
    }
    //reset the state
    global_ignore = false;

    // disable close
    console.log("file number after close " + fileNum);
    // if (fileNum == 1) {
    //      ipcRenderer.send('disable-close', 'ping');
    // }

    //Updates the edits for the file
    loadEdits();
};