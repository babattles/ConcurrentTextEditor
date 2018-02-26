'use strict';

const { ipcRenderer } = require('electron');

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAr4i-0nzmJi9x2bwyJXqQPjsPJfkeN0V0",
    authDomain: "hivetext-dcadf.firebaseapp.com",
    databaseURL: "https://hivetext-dcadf.firebaseio.com",
    projectId: "hivetext-dcadf",
    storageBucket: "hivetext-dcadf.appspot.com",
    messagingSenderId: "254482798300"
};
firebase.initializeApp(config);

var database = firebase.database();

var userSettingsBtn = document.getElementById("userSettingsBtn");
var editor = document.getElementById("editor");

// Authenticate Button is clicked
var AuthListener = document.getElementById("authBtn");
AuthListener.addEventListener('click', function() {
    ipcRenderer.send('open-auth-window', 'ping');
});

// Logout Button is clicked
var LogoutListener = document.getElementById("logoutBtn");
LogoutListener.addEventListener('click', function() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        document.querySelector('#userSettings').classList.add("hidden");
        alert("user logged out");
    }, function(error) {
        // An error happened.
        alert("oops, logout ERROR!");
    });
});

// Listen for response to update username
ipcRenderer.on('update-username-reply', function(event, arg) {
    var user = firebase.auth().currentUser;
    if (user) {
        // User is signed in.
        database.ref().child("users").child(user.uid).child("username").once("value").then(function(snapshot) {
            userSettingsBtn.innerHTML = snapshot.val();
        });
    } else {
        // No user is signed in.
        alert("Can't update username without a user!!");
    }
});

/**
 * Menu Item Listeners
 */
// Listen for Open File Menu Select
ipcRenderer.on('open-file', function(event, arg) {
    openFile();
});

// Listen for Save File Menu Select
ipcRenderer.on('save-file', function(event, arg) {
    saveFile();
});

// Listen for Save File Menu Select
ipcRenderer.on('save-file-as', function(event, arg) {
    saveFileAs();
});

// Listen for Close File Menu Select
ipcRenderer.on('close-file', function(event, arg) {
    closeFile();
});

// Listen for Increase Font Size Menu Select
ipcRenderer.on('increase-font', function(event, arg) {
    fontIncrease();
});

// Listen for Decrease Font Size Menu Select
ipcRenderer.on('decrease-font', function(event, arg) {
    fontDecrease();
});

//Listener for Reset Font Size Menu Select
ipcRenderer.on('reset-font', function(event, arg) {
    fontReset();
});

// Listen for line number toggle
ipcRenderer.on('line-number', function(event, arg) {
    lineNumber();
});

// Listen for change in theme
ipcRenderer.on('change-theme', function(event, arg) {
    if (arg == 'dark') {
        editor.setTheme("ace/theme/ambiance");
    } else if (arg == 'light') {
        editor.setTheme("ace/theme/tomorrow");
    }
});

//drag and drop functionality
document.ondragover = document.ondrop = (e) => {
    e.preventDefault();
};

document.body.ondrop = (e) => {
    var path = e.dataTransfer.files[0].path;
    openFileDrag(path);
    ipcRenderer.send('close-dragged', 'logged');
    e.preventDefault();
};

// Called when user state changes (login/logout)
firebase.auth().onAuthStateChanged(function(user) {
    var authBtn = document.getElementById("authBtn");
    var logoutBtn = document.getElementById("logoutBtn");
    if (user) {
        // User is signed in.
        // update user settings button with username
        database.ref().child("users").child(user.uid).child("username").once("value").then(function(snapshot) {
            userSettingsBtn.innerHTML = snapshot.val();
        });

        // hide/show buttons
        logoutBtn.style.display = "initial";
        authBtn.style.display = "none";
        userSettingsBtn.style.display = "initial";

        // Load user's files
        var filesRef = database.ref("/users/" + user.uid + "/fileList").orderByChild("fileName").on('value', function(snapshot) {
            // Clear files if any are there
            var files = document.getElementById("file-container");
            while (files.firstChild) {
                files.removeChild(files.firstChild);
            }

            // for each file in the user's fileList...
            snapshot.forEach(function(childSnapshot) {
                // make row
                var div = document.createElement("div");
                div.style.background = "green";
                div.style.color = "white";
                div.style.display = "absolute";
                div.style.width = "200px";

                // make label
                var label = document.createElement("label");
                label.style.width = "25%";
                label.textContent = childSnapshot.val().fileName;

                // make delete button
                var deleteBtn = document.createElement("button");
                deleteBtn.style.background = "red";
                deleteBtn.style.color = "white";
                deleteBtn.style.position = "absolute";
                deleteBtn.style.width = "20%";
                deleteBtn.style.right = 0;
                deleteBtn.innerHTML = "X";

                // listener to delete this file from database
                deleteBtn.addEventListener('click', function() {
                    database.ref("/users/" + user.uid + "/fileList").child(childSnapshot.key).remove();
                    database.ref("files").child(childSnapshot.key).remove();
                    closeFile();
                    // disable close menu option
                    ipcRenderer.send('disable-close', 'ping');
                });

                // make open button
                var openBtn = document.createElement("button");
                openBtn.style.background = "green";
                openBtn.style.color = "white";
                openBtn.style.position = "absolute";
                openBtn.style.width = "30%";
                openBtn.style.right = "25%";
                openBtn.innerHTML = "OPEN";

                // listener to open this file from database
                openBtn.addEventListener('click', function() {
                    var file = database.ref("files").child(childSnapshot.key);
                    var modelist = ace.require("ace/ext/modelist");
                    var mode = modelist.getModeForPath(childSnapshot.val().fileName).mode;
                    editor.getSession().setMode(mode);
                    var contents = file.child("fileContents").once('value').then(function(snapshot) {
                        editor.setValue(snapshot.val(), -1);
                    });
                    // enable close menu
                    ipcRenderer.send('enable-close', 'ping');
                });

                // add new entry to list of files
                div.appendChild(label);
                div.appendChild(openBtn);
                div.appendChild(deleteBtn);
                files.appendChild(div);
            });
        });
    } else {
        // No user is signed in.
        authBtn.style.display = "initial";
        logoutBtn.style.display = "none";
        userSettingsBtn.style.display = "none";

        // clear files in filelist
        var files = document.getElementById("file-container");
        while (files.firstChild) {
            files.removeChild(files.firstChild);
        }

        // close any open file
        ipcRenderer.send('close-file-please', 'ping');
    }
});