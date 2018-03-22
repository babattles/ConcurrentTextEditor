var checkConcurrency = function (edit) {
    if (edit) {
        updateFile(edit);
    }
};

var updateFile = function (edit) {
    var editor = ace.edit("editor");
    var currentEdit = edit;
    var oldContents = editor.getSession().getValue();
    var newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.endIndex);
    global_ignore = true;
    editor.getSession().setValue(newContents);
    global_ignore = false;
}