var checkConcurrency = function() {
    editRef.on("child_added", function(snapshot) {
        var newEdit = snapshot.val();
        updateFile(newEdit);
    });
    editRef.on("child_removed", function(snapshot) {
        var newEdit = snapshot.val();
        updateFile();
    });
    editRef.on("child_changed", function(snapshot) {
        var newEdit = snapshot.val();
        updateFile(newEdit);
    });

};
var updateFile = function(edit) {
    //var length = editRef.length;
    /*for(i = 0; i < editRef.length; i++){
        currentEdit = editRef[i];

    }*/
    var editor = ace.edit("editor");
    var currentEdit = edit;
    var oldContents = editor.getSession().getValue();
    var newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit + oldContents.slice(currentEdit.endIndex);
    editor.getSession.setValue(newContents);
}