document.querySelector('#toggle-user-settings').onclick = function() {
    console.log("Toggle user settings");
    document.querySelector('#user-settings').classList.toggle("hidden");
};

changeName = function(name) {
    // console.log(name);
    alert("(TEMP)Changed name to " + name);
    clearChangeName();
}

changeUsername = function(username) {
    // console.log(username);
    alert("(TEMP)Changed username to " + username);
    clearChangeUsername();
}

changePassword = function(password) {
    // console.log(password);
    alert("(TEMP)Changed password to " + password);
    clearChangePassword();
    //need to hash + salt before sending to server
}

// logout = function() {
//     // console.log("User logout");
//     alert("(TEMP)Logged out");
//     clearUserSettings();
// }

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

// document.querySelector('#logout-button').onclick = function() {
//     console.log("User attempt logout");
//     logout();
// };