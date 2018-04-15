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
                    console.log("You are not an admin...\n");
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
                    console.log("You are not an admin...\n");
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
            var user = firebase.auth().currentUser;
            currentFile.child('adminList').once('value', function(snapshot) {
                if (snapshot.hasChild(user.uid)) {
                    let userNames = database.ref('users');
                    userNames.child(userid).on('value', function(userData) {
                        currentFile.child('adminList').child(userid).set({ 'username': userData.val().username });
                        console.log(userData.val().username + " has been made admin ");
                    });
                } else {
                    console.log("You are not an admin...\n");
                }
            });
        }
    }));
    menu.popup(remote.getCurrentWindow());
};