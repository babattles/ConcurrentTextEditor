var admin = function(id) {
    const remote = require('electron').remote;
    const Menu = remote.Menu;
    const MenuItem = remote.MenuItem;
    var menu = new Menu();
    menu.append(new MenuItem({
        label: 'Force accept edit',
        click: function() {
            console.log('accepting edit: ' + id);
            acceptEdit(id);
        }
    }));
    menu.append(new MenuItem({
        type: 'separator'
    }));
    menu.append(new MenuItem({
        label: 'Veto edit',
        click: function() {
            console.log('deleting edit: ' + id);
            deleteEditById(id);
        }
    }));
    menu.popup(remote.getCurrentWindow());
};