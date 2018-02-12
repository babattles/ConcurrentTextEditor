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
        var oldPassword = document.querySelector('#old-password-input').value;
        var newPassword = document.querySelector('#change-password-input').value;
        alert(newPassword);
        var credentials = firebase.auth.EmailAuthProvider.credential(
            user.email,
            oldPassword
        );
        user.reauthenticateWithCredential(credentials).then(function() {
            user.updatePassword(newPassword).then(function() {
                alert('Password change successful');
            }).catch(function(error) {
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

document.querySelector('#userSettingsBtn').onclick = function() {
    document.querySelector('#userSettings').classList.toggle("hidden");
    clearUserSettings();
};

document.querySelector('#changeNameBtn').onclick = function() {
    changeName();
};

document.querySelector('#changeEmailBtn').onclick = function() {
    changeEmail();
};

document.querySelector('#changePasswordBtn').onclick = function() {
    changePassword();
};

document.querySelector('#resetPasswordBtn').onclick = function() {
    sendPasswordResetEmail();
};