var useSettingsBtn = document.getElementById('userSettingsBtn');
var changeUsernameBtn = document.getElementById('changeUsernameBtn');
var changeEmailBtn = document.getElementById('changeEmailBtn');
var changePasswordBtn = document.getElementById('changePasswordBtn');
var newUsernameInput = document.getElementById('change-username-input');
var newEmailInput = document.getElementById('change-email-input');
var oldPasswordInput = document.getElementById('old-password-input');
var newPasswordInput = document.getElementById('new-password-input');
var newPasswordInput2 = document.getElementById('new-password-input2');
var userSettingsPanel = document.getElementById('userSettings');

clearUsername = function() {
    newUsernameInput.value = '';
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
    clearUsername();
    clearEmail();
    clearPassword();
});

changeUsernameBtn.addEventListener("click", function() {
    var newUsername = newUsernameInput.value;
    if (newUsername === '') {
        alert("NAME CANNOT BE BLANK");
        return;
    }
    var user = firebase.auth().currentUser;
    if (user) {
        user.updateProfile({
            displayName: newUsername
        }).then(function() {
            firebase.database().ref().child("users").child(user.uid).update({ 'username': newUsername });
            var userRef = firebase.database().ref().child("users").child(user.uid);
            var fileList = userRef.child('fileList')
            fileList.on('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var currentFile = firebase.database().ref().child('files').child(childSnapshot.key).child('userList').child(user.uid).set({ 'username': newUsername });
                });
            });
            // Send message to main.js to tell index.js to update the username field
            ipcRenderer.send('update-username', 'logged');
            alert("Username updated");
        }).catch(function(error) {
            alert("ERROR: could not change name");
        });
        clearUsername();
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
    if (user) {
        user.updateEmail(newEmail).then(function() {
            firebase.database().ref().child("users").child(user.uid).update({ 'email': newEmail });
            alert("Email updated");
        }).catch(function(error) {
            alert("Email update FAILED!");
        });
        clearEmail();
    }
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