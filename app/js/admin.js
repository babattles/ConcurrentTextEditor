var admin = function(id) {
    const remote = require('electron').remote;
    const Menu = remote.Menu;
    const MenuItem = remote.MenuItem;
    var menu = new Menu();
    menu.append(new MenuItem({
        label: 'Force accept edit',
        click: function() {
            var user = firebase.auth().currentUser;
            if (currentFile.child('adminList').child(user.uid) != null) {
                console.log('accepting edit: ' + id);
                acceptEdit(id);
            } else {
                console.log("You are not an admin...\n");
            }
        }
    }));
    menu.append(new MenuItem({
        type: 'separator'
    }));
    menu.append(new MenuItem({
        label: 'Veto edit',
        click: function() {
            var user = firebase.auth().currentUser;
            if (currentFile.child('adminList').child(user.uid) != null) {
                console.log('deleting edit: ' + id);
                deleteEditById(id);
            } else {
                console.log("You are not an admin...\n");
            }
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
            if (!currentFile.child('adminList').child(user.uid) != null) {
                let userNames = database.ref('users');
                userNames.child(user.uid).on('value', function(snapshot) {
                    currentFile.child('adminList').child(user.uid).set({ 'username': snapshot.val().username });
                });
                console.log(snapshot.val().username + " has been made admin ");
            } else {
                console.log("You are not an admin...\n");
            }
        }
    }));
    menu.popup(remote.getCurrentWindow());
}