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
var usernameBtn = document.getElementById("usernameBtn");
var emailField = document.getElementById('email');
var passwordField = document.getElementById('password');
var usernameField = document.getElementById('username');
var usernameLabel = document.getElementById('usernameLabel');
var forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
var resetPasswordBtn = document.getElementById('resetPasswordBtn');
var state = 'loginRegister';


gLoginBtn.addEventListener('click', function() {
     ipcRenderer.send('google-auth', 'ping');

});


var login = function() {
    // Sign in with email & password
    firebase.auth().signInWithEmailAndPassword(emailField.value, passwordField.value).then(function() {
        // Close auth window
        ipcRenderer.send('close-auth-window', 'logged');
    }).catch(function(error) {
        if (error != null) {
            alert("ERROR LOGGING IN: Please Enter Correct Credentials");
            console.log(error.message);
            return;
        }
    });
}

// Login Button was clicked 
loginBtn.addEventListener('click', function() {
    login();
});

// Enter was pressed on the emailField
emailField.addEventListener('keydown', function(e) {
    if (!e) { var e = window.event; }

    if (e.keyCode == 13) {
        login();
    }
}, false);

// Enter was pressed on the passwordField
passwordField.addEventListener('keydown', function(e) {
    if (!e) { var e = window.event; }

    if (e.keyCode == 13) {
        login();
    } else {

    }
}, false);

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
        forgotPasswordBtn.classList.add('hidden');

        // show set username elements
        usernameField.classList.remove('hidden');
        usernameBtn.classList.remove('hidden');
        usernameLabel.classList.remove('hidden');

        // create a user node in the database
        var user = firebase.auth().currentUser;

        if (user) {
            // User is signed in.
            // set temp username to uid
            firebase.database().ref().child("users").child(user.uid).set({ username: user.uid });
        } else {
            // No user is signed in.
            alert("No user!!");
        }
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
        /* uncomment to reset database data when registering new user */
        //firebase.database().ref().child("users").set(user.uid);

        // update username with provided username
        firebase.database().ref().child("users").child(user.uid).update({ 'username': usernameField.value });

        // Send message to main.js to tell index.js to update the username field
        ipcRenderer.send('update-username', 'logged');
    } else {
        alert("ERROR: current user was NULL");
    }
});

// Close Button was clicked
closeBtn.addEventListener("click", function() {
    if (state === 'loginRegister') {
        ipcRenderer.send('close-auth-window', 'ping');
    } else {
        document.getElementById('closeBtnImg').src = './img/close.png';
        resetPasswordBtn.classList.add('hidden');
        forgotPasswordBtn.classList.remove('hidden');
        passwordField.classList.remove('hidden');
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        state = 'loginRegister';
    }
});

// Forgot password button was clicked
forgotPasswordBtn.addEventListener("click", function() {
    //TODO change the x button into a back arrow. when back arrow clicked, go back to login/register page.
    state = 'resetPassword';
    document.getElementById('closeBtnImg').src = './img/back.png';
    resetPasswordBtn.classList.remove('hidden');
    passwordField.classList.add('hidden');
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    forgotPasswordBtn.classList.add('hidden');
});

// Reset password button was clicked
resetPasswordBtn.addEventListener("click", function() {
    var email = emailField.value;
    var auth = firebase.auth();
    auth.sendPasswordResetEmail(email).then(function() {
        alert("A link to reset password has been sent to " + email);
        emailField.value = '';
        passwordField.value = '';
        document.getElementById('closeBtnImg').src = './img/close.png';
        resetPasswordBtn.classList.add('hidden');
        forgotPasswordBtn.classList.remove('hidden');
        passwordField.classList.remove('hidden');
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        state = 'loginRegister';
    }).catch(function(error) {
        alert("(DEBUG TEMP)failed")
    });
});