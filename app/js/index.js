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

// Increase Font Size was Clicked
var fontListenerI = document.getElementById("fontIncrease");
fontListenerI.addEventListener('click', function() {
    fontIncrease();
});

// Decrease Font Size was Clicked
var fontListenerI = document.getElementById("fontDecrease");
fontListenerI.addEventListener('click', function() {
    fontDecrease();
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

// Listen for Open File Menu Select
ipcRenderer.on('open-file', function(event, arg) {
    openFile();
});

// Listen for Save File Menu Select
ipcRenderer.on('save-file', function(event, arg) {
    saveFile();
});

// Listen for Close File Menu Select
ipcRenderer.on('close-file', function(event, arg) {
    closeFile();
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

        // Load user's files
        var filesRef = database.ref("/users/" + user.uid + "/fileList").orderByChild("fileName").on('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var div = document.createElement("div");
                div.style.background = "green";
                div.style.color = "white";
                div.innerHTML = childSnapshot.val().fileName;
                document.getElementById("file-container").appendChild(div);
            });
        });

    } else {
        // No user is signed in.
        authBtn.style.display = "initial";
        logoutBtn.style.display = "none";
        userSettingsBtn.style.display = "none";
    }
});