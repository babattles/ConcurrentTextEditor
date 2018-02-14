var useSettingsBtn = document.getElementById('userSettingsBtn');
var changeNameBtn = document.getElementById('changeNameBtn');
var changeEmailBtn = document.getElementById('changeEmailBtn');
var changePasswordBtn = document.getElementById('changePasswordBtn');
var newNameInput = document.getElementById('change-name-input');
var newEmailInput = document.getElementById('change-email-input');
var oldPasswordInput = document.getElementById('old-password-input');
var newPasswordInput = document.getElementById('new-password-input');
var newPasswordInput2 = document.getElementById('new-password-input-input');
var userSettingsPanel = document.getElementById('userSettings');

clearName = function() {
    newNameInput.value = '';
}

clearEmail = function() {
    newEmailInput.value = '';
}

clearPassword = function() {
    oldPasswordInput.value = '';
    newPasswordInput.value = '';
    newPasswordInput2.value = '';
}

userSettingsBtn.addEventListener("click", function() {
    userSettingsPanel.classList.toggle("hidden");
    clearName();
    clearEmail();
    clearPassword();
});

changeNameBtn.addEventListener("click", function() {
    var newName = newNameInput.value;
    if (newName === '') {
        alert("NAME CANNOT BE BLANK");
        return;
    }
    var user = firebase.auth().currentUser;
    if (user) {
        user.updateProfile({
            displayName: newName
        }).then(function() {
            firebase.database().ref().child("users").child(user.uid).update({ 'username': newName });
            // Send message to main.js to tell index.js to update the username field
            ipcRenderer.send('update-username', 'logged');
            alert("Username updated");
        }).catch(function(error) {
            alert("ERROR: could not change name");
        });
        clearName();
    } else {
        alert("ERROR: current user was NULL");
    }
});

changeEmailBtn.addEventListener("click", function() {
    var user = firebase.auth().currentUser;
    var userId = user.uid;
    var newEmail = newEmailInput.value;
    if (newEmail === '') {
        alert("EMAIL CANNOT BE BLANK");
        return;
    }
    user.updateEmail(newEmail).then(function() {
        firebase.database().ref('users/' + userId).set({
            email: newEmail
        });
        alert("Email updated");
    }).catch(function(error) {
        alert("Email update FAILED!");
    });
    clearEmail();
});

changePasswordBtn.addEventListener("click", function() {
    if (newPasswordInput.value === newPasswordInput2.value) {
        var user = firebase.auth().currentUser;
        var oldPassword = oldPasswordInput.value;
        var newPassword = newPasswordInput.value;
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
    clearPassword();
});