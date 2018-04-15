const { clipboard } = require('electron');

function copyLink() {
    if (currentKey == undefined) {
        console.log('No File Selected');
        return;
    }
    let fileEdits = database.ref('files/' + currentKey);
    fileEdits.on('value', function(data) {
        if (data.val().link) {
            clipboard.writeText(data.val().link);
        }
    });
}