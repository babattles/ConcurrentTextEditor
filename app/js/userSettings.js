document.querySelector('#toggle-user-settings').onclick = function() {
    console.log("Toggle user settings");
    document.querySelector('#user-settings').classList.toggle("hidden");
};

changeName = function(name) {
    // console.log(name);
    alert("(TEMP)Changed name to " + name);
    // var user = firebase.auth().currentUser;

    // user.updateProfile({
    //     displayName: "Jane Q. User",
    //     photoURL: "https://example.com/jane-q-user/profile.jpg"
    // }).then(function() {
    //     // Update successful.
    // }).catch(function(error) {
    //     // An error happened.
    // });
    clearChangeName();
}

changeUsername = function(username) {
    // console.log(username);
    alert("(TEMP)Changed username to " + username);
    // var user = firebase.auth().currentUser;

    // user.updateEmail("user@example.com").then(function() {
    //     // Update successful.
    // }).catch(function(error) {
    //     // An error happened.
    // });
    clearChangeUsername();
}

changePassword = function(password) {
    // console.log(password);
    alert("(TEMP)Changed password to " + password);
    // var user = firebase.auth().currentUser;
    // var newPassword = "asdf";
    // //salt and hash ppassword;
    // user.updatePassword(newPassword).then(function() {
    //     // Update successful.
    // }, function(error) {
    //     // An error happened.
    // });
    clearChangePassword();
    //need to hash + salt before sending to server
}

// logout = function() {
//     // console.log("User logout");
//     alert("(TEMP)Logged out");
//     clearUserSettings();
// }

sendPasswordResetEmail = function() {
    var auth = firebase.auth();
    // var user = firebase.auth().currentUser
    var emailAddress = "alexjgeier@gmail.com";
    auth.sendPasswordResetEmail(emailAddress).then(function() {
        // Email sent.
    }).catch(function(error) {
        // An error happened.
    });
}

clearChangeName = function() {
    document.querySelector("#change-name-input").value = null;
}

clearChangeUsername = function() {
    document.querySelector("#change-username-input").value = '';
}

clearChangePassword = function() {
    document.querySelector("#old-password-input").value = '';
    document.querySelector("#change-password-input").value = '';
    document.querySelector("#change-password-input2").value = '';
}

clearUserSettings = function() {
    clearChangeName();
    clearChangeUsername();
    clearChangePassword();
}

document.querySelector('#change-name-submit').onclick = function() {
    console.log("User attempt change name");
    changeName(document.querySelector("#change-name-input").value);
};

document.querySelector('#change-username-submit').onclick = function() {
    console.log("User attempt change username");
    changeUsername(document.querySelector("#change-username-input").value);
};

document.querySelector('#change-password-submit').onclick = function() {
    console.log("User attempt change password");
    changePassword(document.querySelector("#change-password-input").value);
};

document.querySelector('#reset-password').onclick = function() {
    console.log("User attempt reset password");
    alert();
    sendPasswordResetEmail();
};

// document.querySelector('#logout-button').onclick = function() {
//     console.log("User attempt logout");
//     logout();
// };