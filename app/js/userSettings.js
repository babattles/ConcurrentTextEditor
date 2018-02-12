// TODO right now, I am just alerting when functions are successful or not, should show a temporary field instead.

document.querySelector('#toggle-user-settings').onclick = function() {
    document.querySelector('#user-settings').classList.toggle("hidden");
    clearUserSettings();
};

changeName = function() {
    var newName = document.querySelector("#change-name-input").value;
    if (newName === '') {
        alert("NAME CANNOT BE BLANK");
        return;
    }
    var user = firebase.auth().currentUser;
    user.updateProfile({
        displayName: newName
    }).then(function() {
        alert("SUCCESS");
    }).catch(function(error) {
        alert("FAIL");
    });
    clearChangeName();
}

changeEmail = function() {
    var newEmail = document.querySelector("#change-email-input").value;
    if (newEmail === '') {
        alert("EMAIL CANNOT BE BLANK");
        return;
    }
    var user = firebase.auth().currentUser;
    user.updateEmail(newEmail).then(function() {
        alert("SUCCESS");
    }).catch(function(error) {
        alert("FAIL");
    });
    clearchangeEmail();
}

changePassword = function() {
    if (document.querySelector("#change-password-input").value === document.querySelector("#change-password-input2").value) {
        var user = firebase.auth().currentUser;
        var password = document.querySelector('#old-password-input').value;
        var credentials = firebase.auth.EmailAuthProvider.credential(
            user.email,
            password
        );
        user.reauthenticateWithCredential(credentials).then(function() {
            user.updatePassword(document.querySelector('#change-password-input').value).then(function() {
                alert('Password change successful');
            }, function(error) {
                alert("Password change unsuccessful");
            });
        }).catch(function(error) {
            alert('Authentication failed');
        });
    } else {
        alert("Passwords must match");
    }
    clearChangePassword();
}

sendPasswordResetEmail = function() {
    var auth = firebase.auth();
    var user = firebase.auth().currentUser;
    var email = user.email;
    auth.sendPasswordResetEmail(email).then(function() {
        alert("EMAIL HAS BEEN SENT");
    }).catch(function(error) {
        alert("FAILURE")
    });
}

clearChangeName = function() {
    document.querySelector("#change-name-input").value = '';
}

clearchangeEmail = function() {
    document.querySelector("#change-email-input").value = '';
}

clearChangePassword = function() {
    document.querySelector("#old-password-input").value = '';
    document.querySelector("#change-password-input").value = '';
    document.querySelector("#change-password-input2").value = '';
}

clearUserSettings = function() {
    clearChangeName();
    clearchangeEmail();
    clearChangePassword();
}

document.querySelector('#change-name-submit').onclick = function() {
    changeName();
};

document.querySelector('#change-email-submit').onclick = function() {
    changeEmail();
};

document.querySelector('#change-password-submit').onclick = function() {
    changePassword();
};

document.querySelector('#reset-password').onclick = function() {
    sendPasswordResetEmail();
};