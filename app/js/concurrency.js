var updateFile = function (edit, useSize) {
    var currentEdit = edit;
    var oldContents = editor.getSession().getValue();
    var newContents;
    if (edit.type == "insert") {
        console.log("1");
        console.log("2");
        if (useSize) {
            console.log("3");
            if (currentEdit.addedSize < 0) {
                console.log("4");
                newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.endIndex - currentEdit.addedSize);
            } else if (currentEdit.addedSize > 0 /*&& !justTyped && justTyped !== undefined*/) {
                console.log("5");
                if (justTyped) {
                    newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.endIndex - currentEdit.addedSize + 1);
                } else {
                    newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.endIndex - currentEdit.addedSize);
                }
            } else {
                newContents = oldContents;
            }
        } else {
            alreadyAdded = false;
            if (!justTyped) {
                newContents = oldContents.slice(0, currentEdit.startIndex) + currentEdit.content + oldContents.slice(currentEdit.startIndex);
            } else {
                newContents = oldContents;
            }
        }
        global_ignore = true;
        editor.getSession().setValue(newContents);
        global_ignore = false;
    } else if (edit.type == "remove") {
        newContents = oldContents;
        global_ignore = true;
        editor.getSession().setValue(newContents);
        global_ignore = false;
        highlight(edit);
    }
}