var checkConcurrency = function(fileName) {
    var file = database.ref("files").child(fileName);
    var editList = file.child('editList');
    editList.on("child_added", function(snapshot) {
        //updateFile();
    });
    editList.on("child_removed", function(snapshot) {
        //updateFile();
    });
    editList.on("child_changed", function(snapshot) {
        //updateFile();
    });

};