var admin = function(id) {
    console.log("ID " + id + " has been right-clicked on...");
    $.contextMenu({
        selector: '*',
        items: {
            "item_one": { name: "Item_one", icon: "./path1" },
            "item_two": { name: "item_two", icon: "./path2" }
        }
    });
    let items = [
        { title: 'Add Sites' },
        { title: 'Reset Login' },
        { title: 'Help' },
        { title: 'Disabled' },
        { title: 'Invisible' },
        {},
        { title: 'Logout' }
    ];
    console.log(items);
};