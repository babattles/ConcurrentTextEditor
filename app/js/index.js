'use strict';
const { ipcRenderer } = require('electron');
var fileNum = 1;

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
var onlineUsersContainer = document.getElementById("online-users");
var currentKey;

// track the user's current open file in the database
var currentFile = null;
// track the user's edits in their current open file
var editRef = null;

// state to track if a file is being opened
var global_ignore = false;

// variable to track the current user globally
var global_user;

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
    global_user = user;
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
        var filesRef = database.ref("/users/" + user.uid + "/fileList").orderByChild("fileName").once('value', function(snapshot) {
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
                    global_ignore = true;
                    closeFile();
                    database.ref("/users/" + user.uid + "/fileList").child(childSnapshot.key).remove();
                    database.ref("files").child(childSnapshot.key).remove();
                    // disable close menu option

                    global_ignore = false;                    
                    //Updates the edits for the file
                    loadEdits();
                });

                //Allows you to get the link for a file
                label.addEventListener('click', function(){
                    copyLink();

                });

                // make open button
                var openBtn = document.createElement("button");
                openBtn.style.background = "green";
                openBtn.style.color = "white";
                openBtn.style.position = "absolute";
                openBtn.style.width = "30%";
                openBtn.style.right = "25%";
                openBtn.innerHTML = "OPEN";

                var file = database.ref("files").child(childSnapshot.key);
                var onlineUsers = file.child('userList');

                var updateUserStatus = function(snapshot) {
                    if (currentKey === childSnapshot.key) {
                        var element = document.getElementById(snapshot.key);
                        if (element == null) {
                            element = document.createElement("div");
                            element.setAttribute("id", snapshot.key);
                            if (snapshot.val().online === 'true') {
                                element.classList.add("collabActive");
                            } else {
                                element.classList.add("collabInactive");
                            }
                            element.appendChild(document.createTextNode(snapshot.val().username));
                            onlineUsersContainer.appendChild(element);
                        } else {
                            if (snapshot.val().online === 'true') {
                                element.classList.remove("collabInactive");
                                element.classList.add("collabActive");
                            } else {
                                element.classList.remove("collabActive");
                                element.classList.add("collabInactive");
                            }
                        }
                    }
                }

                //When a user creates a file or gains access to a file
                onlineUsers.on("child_added", function(snapshot) {
                    updateUserStatus(snapshot);
                });

                //When a user is deleted from the file userlist (ie. no longer has access)
                onlineUsers.on("child_removed", function(snapshot) {
                    var element = document.getElementById(snapshot.key);
                    if (element != null) {
                        element.parentNode.removeChild(element);
                    }
                });

                onlineUsers.on("child_changed", function(snapshot) {
                    updateUserStatus(snapshot);
                });

                // listener to open this file from database
                openBtn.addEventListener('click', function() {
                    if (currentKey != childSnapshot.key) {
                        //Set online status of old file to false
                        if (currentKey != null && currentKey != '') {
                            database.ref("files/" + currentKey + "/userList/" + user.uid + "/online").set("false");
                        }
                        //Remove all users from GUI 
                        while (onlineUsersContainer.firstChild) {
                            onlineUsersContainer.removeChild(onlineUsersContainer.firstChild);
                        }
                        //Update GUI to show already online users
                        file.child('userList').orderByChild("username").once('value', function(snapshot) {
                            snapshot.forEach(function(childSnapshot) {
                                var element = document.createElement("div");
                                element.setAttribute("id", childSnapshot.key);
                                if (childSnapshot.val().online === 'true') {
                                    element.classList.add("collabActive");
                                } else if (childSnapshot.key != user.uid) {
                                    element.classList.add("collabInactive");
                                }
                                element.appendChild(document.createTextNode(childSnapshot.val().username));
                                onlineUsersContainer.appendChild(element);
                            });
                        });
                        currentKey = childSnapshot.key;
                        setCurrentFile(childSnapshot.key);
                        file.child('userList').child(user.uid).child('online').set('true');
                        var modelist = ace.require("ace/ext/modelist");
                        var mode = modelist.getModeForPath(childSnapshot.val().fileName).mode;
                        editor.getSession().setMode(mode);
                        var contents = file.child("fileContents").once('value').then(function(snapshot) {
                            global_ignore = true;
                            //Create a flag to check if the files is opened
                            var flag = 1;

                            //Create a new tab
                            for (i in tabs) {
                                //Update the flag if the filename exist in tabs[]
                                if (tabs[i] == childSnapshot.val().fileName) {
                                    flag = 0;
                                }
                            }

                            //Add a new tab
                            if (flag) {
                                editor.setValue(snapshot.val(), -1);
                                fileNum++;
                                addTab(childSnapshot.val().fileName);
                            }

                            global_ignore = false;
                        });
                        // set the current open file to the new file
                        currentFile = file;

                        // set the editRef
                        editRef = currentFile.child("edits");

                        // load the file's current edits (clear first, in case coming from another file)
                        clearEdits();
                        //implements concurrency to update files across all users
                        checkConcurrency();
                        getEdits(); // Also listens for incoming edits
                        // enable close menu
                        ipcRenderer.send('enable-close', 'ping');
                    }
                    //Loads the edits for the file
                    loadEdits();
                });

                // add new entry to list of files
                div.appendChild(label);
                div.appendChild(openBtn);
                div.appendChild(deleteBtn);
                files.appendChild(div);
            });
        });

        /* EDIT FUNCTIONALITY */
        editor.getSession().on('change', function(delta) {
            // delta.start, delta.end, delta.lines, delta.action
            if (!global_ignore && editRef != null) {
                var startIndex = editor.session.doc.positionToIndex(delta.start, 0);
                var endIndex = editor.session.doc.positionToIndex(delta.end, 0);
                setEdit(startIndex, endIndex, delta);
                // output for debugging
                console.log("**EDITS**");
                for (var x = 0; x < edits.length; x++) {
                    console.log(edits[x]);
                }
            }
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