/**
 * Created by bbattles on 2/8/2018
 * Login & Register Functionality
 * */
'use strict';
const {ipcRenderer} = require('electron');

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
var usernameBtn = document.getElementById("usernameBtn");
var emailField = document.getElementById('email');
var passwordField = document.getElementById('password');
var usernameField = document.getElementById('username');
var usernameLabel = document.getElementById('usernameLabel');
  
// Login Button was clicked 
loginBtn.addEventListener('click', function(e) {
    var loginEmail = document.getElementById('email');
    var loginPassword = document.getElementById('password');
  
    // Sign in with email & password
    firebase.auth().signInWithEmailAndPassword(loginEmail.value, loginPassword.value).then(function() {
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
    // Create a user with email & password then ask for username
    firebase.auth().createUserWithEmailAndPassword(emailField.value, passwordField.value).then(function() {
        // hide all the previous fields
        emailField.classList.add('hidden');
        passwordField.classList.add('hidden');
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        closeBtn.classList.add('hidden');

        // show set username elements
        usernameField.classList.remove('hidden');
        usernameBtn.classList.remove('hidden');
        usernameLabel.classList.remove('hidden');

    }).catch(function(error) {
        if (error != null) {
            alert("ERROR REGISTERING ACCOUNT");
            console.log(error.message);
            return;
        }
    });
});

// Set username button was clicked
usernameBtn.addEventListener('click', function() {
    var user = firebase.auth().currentUser;
    if (user) {
        // add user with username to database
        firebase.database().ref().child("users").child(user.uid).set({username : usernameField.value});
        // Close auth window
        ipcRenderer.send('close-auth-window', 'logged');
    } else {
        alert("ERROR: current user was NULL");
    }
});

// Close Button was clicked
closeBtn.addEventListener("click", function() {
    ipcRenderer.send('close-auth-window', 'ping');
});
