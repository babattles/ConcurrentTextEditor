var checkConcurrency = function(edit) {
    updateFile(edit);
};
var updateFile = function(edit) {
    var editor = ace.edit("editor");
    var currentEdit = edit;
    var oldContents = editor.getSession().getValue();
    var newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.endIndex);
    editor.getSession().setValue(newContents);
}