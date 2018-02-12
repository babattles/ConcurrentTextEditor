/**
 * Created by bbattles on 2/8/2018
 * Login & Register Functionality
 * */
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

var loginBtn = document.getElementById("loginBtn");
var registerBtn = document.getElementById("registerBtn");
var closeBtn = document.getElementById("closeBtn");

// Login Button was clicked 
loginBtn.addEventListener('click', function(e) {
    var loginEmail = document.getElementById('email').value;
    var loginPassword = document.getElementById('password').value;

    // Sign in with email & password
    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword).then(function() {
        // Close auth window
        ipcRenderer.send('close-auth-window', 'logged');
    }).catch(function(error) {
        if (error != null) {
            alert("ERROR LOGGING IN: Please Enter Correct Credentials");
            console.log(error.message);
            return;
        }
    });
});

// Register Button was clicked
registerBtn.addEventListener("click", function() {
    var emailField = document.getElementById('email').value;
    var passwordField = document.getElementById('password').value;

    firebase.auth().createUserWithEmailAndPassword(emailField, passwordField).then(function() {
        alert('User Registered... Logging in...');
        ipcRenderer.send('close-auth-window', 'logged');
    }).catch(function(error) {
        if (error != null) {
            alert("ERROR REGISTERING ACCOUNT");
            console.log(error.message);
            return;
        }
    });
});

// Close Button was clicked
closeBtn.addEventListener("click", function() {
    ipcRenderer.send('close-auth-window', 'ping');
});