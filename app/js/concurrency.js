var checkConcurrency = function (edit, useSize) {
    if (edit) {
        updateFile(edit, useSize);
    }
};

var updateFile = function (edit, useSize) {
    var editor = ace.edit("editor");
    var currentEdit = edit;
    if (!justTyped && justTyped !== undefined) {
        // console.log("ADDED SIZE = " + currentEdit.addedSize);
        // var cursorPosition = editor.getCursorPosition();
        var oldContents = editor.getSession().getValue();
        var newContents;
        if (useSize) {
            if (currentEdit.addedSize < 0) {
                newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.endIndex - currentEdit.addedSize);
            } else {
                newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.endIndex - currentEdit.addedSize);
            }
        } else {
            alreadyAdded = false;
            newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.startIndex);
        }
        global_ignore = true;
        editor.getSession().setValue(newContents);
        // editor.setCursorPosition(cursorPosition.row, cursorPosition.row);
        global_ignore = false;
    }
}