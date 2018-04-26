var admin = function(id) {
    const remote = require('electron').remote;
    const Menu = remote.Menu;
    const MenuItem = remote.MenuItem;
    var menu = new Menu();
    menu.append(new MenuItem({
        label: 'Force accept edit',
        click: function() {
            var user = firebase.auth().currentUser;
            currentFile.child('adminList').once('value', function(snapshot) {
                if (snapshot.hasChild(user.uid)) {
                    console.log('accepting edit: ' + id);
                    acceptEdit(id);
                } else {
                    alert("You are not an admin...");
                }
            });
        }
    }));
    menu.append(new MenuItem({
        type: 'separator'
    }));
    menu.append(new MenuItem({
        label: 'Veto edit',
        click: function() {
            var user = firebase.auth().currentUser;
            currentFile.child('adminList').once('value', function(snapshot) {
                if (snapshot.hasChild(user.uid)) {
                    console.log('deleting edit: ' + id);
                    deleteEditById(id);
                } else {
                    alert("You are not an admin...");
                }
            });
        }
    }));
    menu.popup(remote.getCurrentWindow());
};

var makeAdmin = function(userid) {
    const remote = require('electron').remote;
    const Menu = remote.Menu;
    const MenuItem = remote.MenuItem;
    var menu = new Menu();
    menu.append(new MenuItem({
        label: 'Make admin',
        click: function() {
            var ok = confirm("Warning: once a user is given administrative privileges for this file:\n"
                + "-the user may remove other users\n"
                + "-the user may reject or accept an edit without consensus\n"
                + "-the user may change the acceptance settings");
            if (!ok) return;
            var user = firebase.auth().currentUser;
            currentFile.child('adminList').once('value', function(snapshot) {
                if (!snapshot.hasChild(userid)) {
                    if (snapshot.hasChild(user.uid)) {
                        let userNames = database.ref('users');
                        userNames.child(userid).on('value', function(userData) {
                            currentFile.child('adminList').child(userid).set({ 'username': userData.val().username });
                            console.log(userData.val().username + " has been made admin ");
                        });
                    } else {
                        alert("You are not an admin...");
                    }
                } else {
                    alert("User is already an admin!");
                }
            });
        }
    }));
    menu.popup(remote.getCurrentWindow());
};

var updateAdminStatus = function(file, user){

    //console.log('updateAdminStatus');
    //Remove all users from GUI 
    while (onlineUsersContainer.firstChild) {
        onlineUsersContainer.removeChild(onlineUsersContainer.firstChild);
    }

    //Update GUI to show already online users
    file.child('userList').orderByChild("username").once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
             //childSnapshot.key is the userID
            var element = document.createElement("div");
            element.setAttribute("id", childSnapshot.key);
            if (childSnapshot.val().online === 'true') {
                element.classList.add("collabActive");
            } else if (childSnapshot.key != user.uid) {
                element.classList.add("collabInactive");
            }

            element.appendChild(document.createTextNode(childSnapshot.val().username));

            //display to everyone if user is an admin
            userIsAdmin(file, childSnapshot.key, function(isAdmin){
                //console.log('index', isAdmin);
                if (isAdmin){
                    //console.log('user:', childSnapshot.val().username, 'key', isAdmin);
                    //Icon made by zlatko-najdenovski from https://www.flaticon.com
                    var adminIcon = document.createElement("INPUT");
                    adminIcon.src = "./img/admin.png";
                    adminIcon.type = "image";
                    adminIcon.className = "admin-icon";
                    element.appendChild(adminIcon);
                }
            });

            //display delete button is global_user is admin
            userIsAdmin(file, global_user.uid, function(isAdmin){
                if (isAdmin){

                    //allow user to make others admin
                    element.addEventListener("contextmenu", function(event) {
                        makeAdmin(childSnapshot.key);
                    });

                    //console.log('user:', childSnapshot.val().username, 'delete', isAdmin);
                    getNumAdmins(file, function(numAdmins){
                        if ( numAdmins <= 1 && childSnapshot.key == global_user.uid){
                            //do not create delete button for current user if numadmins <= 1
                        } else {
                            var deleteUserBtn = document.createElement("INPUT");
                            deleteUserBtn.src = "./img/close.png";
                            deleteUserBtn.type = "image";
                            deleteUserBtn.className = "delete-user";
                            deleteUserBtn.onclick = function(){deleteUser(childSnapshot.key)};
                            element.appendChild(deleteUserBtn);
                        }
                    });
                }
            });

            element.addEventListener("mouseover", function(event) {
                unhighlightAllRemovals();
                highlightEditsByUser(childSnapshot.key);
            });
            element.addEventListener("mouseout", function(event) {
                unhighlightEditsByUser(childSnapshot.key);
                highlightAllRemovals();
            });
            onlineUsersContainer.appendChild(element);
        });
    });
}


var userIsAdmin = function (file, userID, _callback){
    //console.log('usadmin', userID);
    file.child('adminList').child(userID).once('value', function(snapshot) {
            var isAdmin;
            if (snapshot.exists()) {
                isAdmin = true;
            } else {
                isAdmin = false;
            }
            //console.log('admin', isAdmin);
            _callback(isAdmin);
        });
};

var getNumAdmins = function (file, _callback){
    file.child('adminList').once('value', function(snapshot) {
            _callback(snapshot.numChildren());
        });
};


var clearAfterDelete = function() {
    // set the state (so opening a file doesn't stage an edit)
    global_ignore = true;

    //clear screen
    editor.session.setValue('');

    var onlineUsersContainer = document.getElementById("online-users");
    //Remove all users from GUI 
    while (onlineUsersContainer.firstChild) {
        onlineUsersContainer.removeChild(onlineUsersContainer.firstChild);
    }

    //Remove this tab
    //closeTab();
    fileNum--;
    path = '';
    currentKey = '';
    //reset the state
    global_ignore = false;

    // disable close
    console.log("file number after close " + fileNum);

    //Updates the edits for the file
    loadEdits();
};

function deleteUser(userID){
    //Remove file from deleted user’s fileList
    database.ref("users").child(userID).child('fileList').child(currentKey).remove();
    //If admin, remove from adminList
    database.ref("files").child(currentKey).child('adminList').child(userID).remove();
    //Remove user from file’s userList
    database.ref("files").child(currentKey).child('userList').child(userID).remove();
    
    //remove user from all accepted lists
    for (var i = 0; i < edits.length; i++) {
        database.ref().child("files").child(currentKey).child('edits').child(edits[i].id)
            .child('accepted').orderByChild('id')
            .equalTo(userID)
            .once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    database.ref().child("files").child(currentKey)
                        .child('edits').child(edits[i].id)
                        .child('accepted').child(childSnapshot.key).remove();
                });
            });
    }
    //update the List of edits with the correct users and counts
    loadEdits();

    console.log('from deleteUser');
    updateEditAcceptance();
}
