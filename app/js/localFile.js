const electron = require('electron');
const dialog = require('electron').remote.dialog
var currentFileName = 'untitled';
var currentFileType = '';
var currentUserName = '';

document.querySelector('#openedFile').onchange = function() {
    var file = document.getElementById('openedFile').files[0];
    if (file) {
        currentFileName = file.name;
        currentFileType = file.type;
        var fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = function loaded(evt) {
            var fileString = evt.target.result;
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
                        'fileContents': fileString,
                    });
                    // add user to file's userList
                    newFile.child('userList').child(user.uid).set({'username' : currentUserName}).then(function() {
                        // add fileID to user's fileList
                        userRef.child('fileList').child(newFile.key).set({'fileName' : currentFileName});
                    });
                });
            } 
            // File contents shown in ace editor. (Right now, it's the temporary text area.)
            document.getElementById('temptextarea').textContent = fileString;
        }
    }
};

// TODO it looks like I can use node to call some sort of local script which may be able to save the file in its original location.
document.querySelector('#saveFileBtn').onclick = function() {
    var textToSave = document.getElementById("temptextarea").value; //TODO change to id of ace editor
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = currentFileName + currentFileType;
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = function() {
        document.body.removeChild(event.target);
    }
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink); 
    downloadLink.click();
}