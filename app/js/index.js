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

// Listen for line number toggle
ipcRenderer.on('line-number', function(event, arg) {
    lineNumber();
});

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
    } else {
        // No user is signed in.
        authBtn.style.display = "initial";
        logoutBtn.style.display = "none";
        userSettingsBtn.style.display = "none";
    }
});

//drag and drop functionality
document.ondragover = document.ondrop = (e) => {
    e.preventDefault();
};

document.body.ondrop = (e) => {
    //console.log(e.dataTransfer.files[0].path);
    //openFile();
    alert("dragged");
    e.preventDefault();
};