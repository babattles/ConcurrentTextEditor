var f = location.href.split("/").slice(-1);
if (f == "index.html") {
    var Range = ace.require("ace/range").Range;
}

var alertSent = false;

var edits = [];

var glo_e;
var DarkRemovalHighlight;
var x_insert = false;
// Retrieve new edits as they are added to the database (including your own!)
var getEdits = function() {

    currentFile.child("delta").on("child_added", function() {
        //For the current implementation, this not needed, but I'm going to leave the function just in case it's needed later.
    });

    currentFile.child("delta").on("child_changed", function(snapshot) {
        if (fileMode == "live") {
            // console.log(snapshot.ref.parent);
            var parsedContent = snapshot.val();
            // console.log("parsedContent = " + parsedContent);
            var startIndex = parsedContent.slice(0, parsedContent.indexOf(";"));
            parsedContent = parsedContent.slice(parsedContent.indexOf(";") + 1);
            var endIndex = parsedContent.slice(0, parsedContent.indexOf(";"));
            parsedContent = parsedContent.slice(parsedContent.indexOf(";") + 1);
            var type = parsedContent.slice(0, parsedContent.indexOf(";"));
            parsedContent = parsedContent.slice(parsedContent.indexOf(";") + 1);
            var editType = parsedContent.slice(0, parsedContent.indexOf(";"));
            parsedContent = parsedContent.slice(parsedContent.indexOf(";") + 1);
            var editID = parsedContent.slice(0, parsedContent.indexOf(";"));
            parsedContent = parsedContent.slice(parsedContent.indexOf(";") + 1);
            updateEditor(startIndex, endIndex, type, editType, editID, parsedContent);
        }
    });

    editRef.on("child_added", function(snapshot, prevChildKey) { // prevChildKey is the key of the last child added (we may need it, idk but it's there)
        // console.log("child added...");
        var e = snapshot.val();
        edits.push({
            start: e.startIndex,
            end: e.endIndex,
            content: e.content,
            type: e.type,
            user: e.user,
            comment: e.comment,
            id: snapshot.key,
            addedSize: 0,
        });
    });

    editRef.on("child_removed", function(snapshot) { // prevChildKey is the key of the last child added (we may need it, idk but it's there)
        //console.log("child removed...");
        var e = snapshot.val();

        if (e.type == "insert" && !e.hasBeenAccepted) { // insert
            global_ignore = true;
            var cursor = editor.getCursorPosition();
            var prefix = editor.session.getValue().slice(0, e.startIndex);
            if (x_insert) {
                var suffix = editor.session.getValue().slice(e.endIndex);
                x_insert = false;
            } else {
                var suffix = editor.session.getValue().slice(e.endIndex);
            }
            editor.session.setValue(prefix + suffix);
            editor.selection.moveTo(cursor.row, cursor.column);
            global_ignore = false;
        } else if (e.type == "remove" && e.hasBeenAccepted) {
            global_ignore = true;
            var cursor = editor.getCursorPosition();
            var prefix = editor.session.getValue().slice(0, e.startIndex);
            var suffix = editor.session.getValue().slice(e.endIndex);
            editor.session.setValue(prefix + suffix);
            editor.selection.moveTo(cursor.row, cursor.column);
            global_ignore = false;
        }
        editUnhighlight(snapshot.key);
        // Delete edit from edits[]
        for (i in edits) {
            if (edits[i].id == snapshot.key) {
                edits.splice(i, 1);
            }
        }
        if (DarkRemovalHighlight) {
            editor.session.removeMarker(DarkRemovalHighlight);
        }
    });

    // update local edit array when edits are changed on the database
    editRef.on("child_changed", function(snapshot) {
        var changedEdit = snapshot.val();
        if (changedEdit.type == "remove") {
            editUnhighlight(snapshot.key);
        }
        edits.find((obj, index) => {
            if (obj.id == snapshot.key && (obj.start != changedEdit.startIndex || obj.end != changedEdit.endIndex)) {
                edits[index] = {
                    start: changedEdit.startIndex,
                    end: changedEdit.endIndex,
                    content: changedEdit.content,
                    type: changedEdit.type,
                    user: changedEdit.user,
                    comment: changedEdit.comment,
                    id: snapshot.key,
                    addedSize: changedEdit.addedSize,
                };
            }
        });
        if (changedEdit.type == "remove") {
            editHighlight(snapshot.key);
        }
    });

}

/* helper function */
// Returns an array of strings as a single multi-line string
var stringify = function(lines) {
    var result = "";
    var x = 1;
    for (var x = 0; x < lines.length; x++) {
        if (x < lines.length - 1) {
            result += lines[x] + "\n";
        } else {
            result += lines[x];
        }
    }
    return result;
}

/* Helper - Clear all edits */
var clearEdits = function() {
    edits.splice(0, edits.length);
}

/* Helper - Get the database reference for an edit */
var getEditRef = function(edit) {
    if (editRef == null) return null;
    return editRef.child("" + edit.id);
}

/* Helper - Get the database reference for an edit given edit.id*/
var getEditRefWithId = function(editID) {
    if (editRef == null) return null;
    return editRef.child("" + editID);
}

var getEditById = function(editId) {
    for (var i = 0; i < edits.length; i++) {
        if (edits[i].id == editId) {
            return edits[i];
        }
    }
}

/* Post a new edit to the database */
var postEdit = function(edit) {
    var newEdit = editRef.push(); // generate a new edit
    newEdit.set({
        'startIndex': edit.start,
        'endIndex': edit.end,
        'content': edit.content,
        'type': edit.type,
        'user': edit.user,
        'comment': edit.comment,
        'addedSize': edit.addedSize,
    });
    edit.id = newEdit.key;
}

/* Update your existing edit in the database */
var updateEdit = function(edit, size) {
    var ref = getEditRef(edit);
    glo_e = ref;
    return ref.update({
        content: edit.content,
        endIndex: edit.end,
        startIndex: edit.start,
        addedSize: size,
    });
}


/* Delete an edit from the database */
var deleteEdit = function(edit, size, type) {
    var ref = getEditRef(edit);
    editRef.once('value', function(snapshot) {
        justTyped = true;
        snapshot.forEach(function(child) {
            var e = child.val();
            if (e.startIndex > edit.end - size) {
                child.ref.update({
                    startIndex: e.startIndex - size,
                    endIndex: e.endIndex - size,
                    addedSize: 0,
                });
            }
        });
    });
    return ref.remove();
}

/* Fixes indecies for all edits after current edit */
// edit is the updated/new edit
// size is the amount to increase all other edits by
var fixIndices = function(edit, size, type) {
    //reset accepted count on edit on change
    editRef.child(edit.id).child('accepted').remove();
    if (type == "insert") {
        editRef.once('value', function(snapshot) {
            justTyped = true;
            snapshot.forEach(function(child) {
                var e = child.val();
                if (e.startIndex > edit.end - size) {
                    if (type == "insert") {
                        child.ref.update({
                            startIndex: e.startIndex + size,
                            endIndex: e.endIndex + size,
                            addedSize: 0,
                        });
                    } else if (type == "remove") {
                        child.ref.update({
                            startIndex: e.startIndex - size,
                            endIndex: e.endIndex - size,
                            addedSize: 0,
                        });
                    }
                } else if (child.key == edit.id) { // add the addedSize property for concurrency
                    if (type == "insert") {
                        child.ref.update({
                            content: edit.content,
                            endIndex: edit.end,
                            startIndex: edit.start,
                            addedSize: size,
                        });
                        edit.addedSize = size;
                    } else if (type == "remove") {
                        child.ref.update({
                            content: edit.content,
                            endIndex: edit.end,
                            startIndex: edit.start,
                            addedSize: 0 - size,
                        });
                        edit.addedSize = 0 - size;
                    }
                } else {
                    child.ref.update({
                        addedSize: 0,
                    });
                }
            });
        });
    } else if (type == "remove") {
        editRef.once('value', function(snapshot) {
            justTyped = true;
            snapshot.forEach(function(child) {
                var e = child.val();
                if (e.startIndex > edit.end - size) {
                    child.ref.update({
                        startIndex: e.startIndex - size,
                        endIndex: e.endIndex - size,
                        addedSize: 0,
                    });
                } else if (child.key == edit.id) { // add the addedSize property for concurrency
                    child.ref.update({
                        content: edit.content,
                        endIndex: edit.end,
                        startIndex: edit.start,
                        addedSize: 0 - size,
                    });
                    edit.addedSize = 0 - size;
                }
            });
        });
    }
}

var removeTypedText = function(startIndex, endIndex, delta) {
    if (delta.action == "insert") {
        global_ignore = true;
        var cursor = editor.getCursorPosition();
        var prefix = editor.session.getValue().slice(0, startIndex);
        var suffix = editor.session.getValue().slice(endIndex);
        editor.session.setValue(prefix + suffix);
        editor.selection.moveTo(cursor.row, cursor.column);
        global_ignore = false;
    } else {
        global_ignore = true;
        var cursor = editor.getCursorPosition();
        var prefix = editor.session.getValue().slice(0, startIndex);
        var suffix = editor.session.getValue().slice(startIndex);
        editor.session.setValue(prefix + stringify(delta.lines) + suffix);
        editor.selection.moveTo(cursor.row, cursor.column);
        global_ignore = false;
    }
}

var updateRemoval = function(edit, size) {
    //reset accepted count on edit on change
    editRef.child(edit.id).child('accepted').remove();
    childRef = editRef.child(edit.id);
    childRef.update({
        content: edit.content,
        endIndex: edit.end,
        startIndex: edit.start,
        addedSize: 0 - size,
    });
    edit.addedSize = 0 - size;
}

/* Take a startIndex, endIndex, and the change, and make an edit */
var setEdit = function(startIndex, endIndex, delta) {
    removeTypedText(startIndex, endIndex, delta);
    if (fileMode == "live") {
        // get the current user
        var user = firebase.auth().currentUser;
        if (user) {
            var bool = 0;
            bool = edits.find((obj, index) => {
                if (obj.start < startIndex && startIndex < obj.end && delta.action == "insert" && obj.type == "insert") { // new addition was within an existing edit

                    currentFile.child("delta").set({
                        'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + obj.type + ";" + obj.id + ";" + stringify(delta.lines)
                    });

                    //console.log("added within");
                    edits[index].content = obj.content.substring(0, startIndex - obj.start) + stringify(delta.lines) + obj.content.substring(startIndex - obj.start, obj.content.length);
                    edits[index].start = obj.start;
                    edits[index].end = obj.end + (endIndex - startIndex);
                    edits[index].type = delta.action;
                    edits[index].user = user.uid;
                    fixIndices(edits[index], endIndex - startIndex, delta.action);
                    return true; // stop searching
                } else if (obj.start == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the beginning of an existing edit

                    currentFile.child("delta").set({
                        'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + obj.type + ";" + obj.id + ";" + stringify(delta.lines)
                    });

                    //console.log("added to beginning");
                    edits[index].start = startIndex;
                    edits[index].end = obj.end + (endIndex - startIndex);
                    edits[index].content = stringify(delta.lines) + obj.content;
                    edits[index].type = delta.action;
                    edits[index].user = user.uid;
                    fixIndices(edits[index], endIndex - startIndex, delta.action);
                    return true;
                } else if (obj.end == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the end of an existing edit

                    currentFile.child("delta").set({
                        'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + obj.type + ";" + obj.id + ";" + stringify(delta.lines)
                    });

                    //console.log("added to end");
                    edits[index].start = obj.start;
                    edits[index].end = endIndex;
                    edits[index].content = obj.content + stringify(delta.lines);
                    edits[index].type = delta.action;
                    edits[index].user = user.uid;
                    fixIndices(edits[index], endIndex - startIndex, delta.action);
                    return true;
                } else if (obj.start == endIndex && obj.type == "remove" && delta.action == "remove") { // coalesce removal right
                    //console.log("coalesce removal right");
                    edits[index].start = startIndex;
                    edits[index].end = obj.end;
                    edits[index].content = stringify(delta.lines) + obj.content;
                    edits[index].type = delta.action;
                    edits[index].user = user.uid;
                    updateRemoval(edits[index], endIndex - startIndex);
                    //fixIndices(edits[index], endIndex - startIndex, "remove");
                    return true;
                } else if (obj.end == startIndex && obj.type == "remove" && delta.action == "remove") { // coalesce removal left
                    edits[index].start = obj.start;
                    edits[index].end = endIndex;
                    edits[index].content = obj.content + stringify(delta.lines);
                    edits[index].type = delta.action;
                    edits[index].user = user.uid;
                    updateRemoval(edits[index], endIndex - startIndex);
                    //fixIndices(edits[index], endIndex - startIndex, "remove");
                    return true;
                } else if (obj.start > startIndex && obj.end < endIndex && delta.action == "remove") { // removed an edit as well as content on both sides

                    currentFile.child("delta").set({
                        'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + obj.type + ";" + obj.id + ";" + stringify(delta.lines)
                    });

                    var cursor = editor.getCursorPosition()
                    global_ignore = true;
                    var prefix = editor.session.getValue().substring(0, startIndex);
                    var suffix = editor.session.getValue().substring(endIndex - 1);
                    editor.session.setValue(prefix + stringify(delta.lines) + suffix);
                    editor.selection.setRange(new Range(0, cursor.row, 0, cursor.column));
                    global_ignore = false;

                    console.log("edit and both sides");
                    deleteEdit(edits[index]);
                    edits.splice(index, 1);
                    var e = {
                        start: startIndex,
                        end: endIndex - (obj.end - obj.start),
                        content: stringify(delta.lines).substring(0, obj.start - startIndex) + stringify(delta.lines).substring(obj.end - startIndex, stringify(delta.lines).length),
                        type: delta.action,
                        user: user.uid,
                    };
                    postEdit(e);
                    fixIndices(edits[index], obj.end - obj.start, delta.action);
                    return true;
                } else if (obj.start <= startIndex && obj.end < endIndex && startIndex <= obj.end && delta.action == "remove") { // removed some or all of an edit as well as content on the right side
                    console.log("remove edit and right side");

                    currentFile.child("delta").set({
                        'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + obj.type + ";" + obj.id + ";" + stringify(delta.lines)
                    });


                    var e = {
                        start: obj.end,
                        end: endIndex,
                        content: stringify(delta.lines).substring(obj.end - obj.start, endIndex - startIndex),
                        type: delta.action,
                        user: user.uid,
                    };
                    if (obj.start == startIndex) {
                        //console.log("removing whole edit");
                        fixIndices(edits[index], edits[index].end - edits[index].start, delta.action);
                        deleteEdit(edits[index]);
                        edits.splice(index, 1);
                    } else {
                        //console.log("edit to the right ->");
                        edits[index].start = obj.start;
                        edits[index].end = startIndex;
                        edits[index].content = obj.content.substring(0, startIndex - obj.start);
                        edits[index].type = "insert";
                        edits[index].user = user.uid;
                        fixIndices(edits[index], obj.end - startIndex, delta.action);
                    }
                    postEdit(e);
                    return true;
                } else if (obj.start > startIndex && obj.end >= endIndex && endIndex > obj.start && delta.action == "remove") { // removed some or all of an edit as well as content on the left side
                    console.log("remove edit and left");

                    currentFile.child("delta").set({
                        'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + obj.type + ";" + obj.id + ";" + stringify(delta.lines)
                    });

                    var e = {
                        start: startIndex,
                        end: obj.start,
                        content: stringify(delta.lines).substring(0, obj.start - startIndex),
                        type: delta.action,
                        user: user.uid,
                    };
                    if (obj.end == endIndex) {
                        //console.log("removing whole edit");
                        fixIndices(edits[index], edits[index].end - edits[index].start, delta.action);
                        deleteEdit(edits[index]);
                        edits.splice(index, 1);
                    } else {
                        //console.log("edit to the left <-");
                        edits[index].content = obj.content.substring(endIndex - obj.start, obj.content.length);
                        edits[index].start = endIndex;
                        edits[index].end = obj.end;
                        edits[index].type = "insert";
                        edits[index].user = user.uid;
                        fixIndices(edits[index], endIndex - startIndex, delta.action);
                    }
                    postEdit(e);
                    return true;
                } else if (obj.start <= startIndex && endIndex <= obj.end && delta.action == "remove" && obj.type == "insert") { // removed something from within an edit
                    console.log("remove from within");

                    if (obj.start == startIndex && obj.end == endIndex) { // you're deleting the last of an edit
                        deleteEdit(edits[index], edits[index].end - edits[index].start, delta.action);
                        edits.splice(index, 1);
                    } else {
                        currentFile.child("delta").set({
                            'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + obj.type + ";" + obj.id + ";" + stringify(delta.lines)
                        });
                        // console.log("Not really an insert");
                        edits[index].content = obj.content.substring(0, startIndex - obj.start) + obj.content.substring(endIndex - obj.start, obj.content.length);
                        edits[index].start = obj.start;
                        edits[index].end = obj.end - (endIndex - startIndex);
                        edits[index].type = "insert";
                        edits[index].user = user.uid;
                        fixIndices(edits[index], endIndex - startIndex, delta.action);
                    }
                    return true;
                } else if (obj.start <= startIndex && endIndex <= obj.end && delta.action == "remove" && obj.type == "remove") { // removed something from within a removal edit
                    return true;
                } else if (obj.start <= startIndex && endIndex <= obj.end && delta.action == "insert" && obj.type == "remove") { // added something within a removal edit
                    return true;
                }

            });
            // never found parent edit, so add edit to edits
            if (!bool) {
                // console.log("no parent");
                var e = {
                    start: startIndex,
                    end: endIndex,
                    content: stringify(delta.lines),
                    type: delta.action,
                    user: user.uid,
                    comment: "",
                    addedSize: endIndex - startIndex,
                }
                postEdit(e);
                currentFile.child("delta").set({
                    'deltaToParse': startIndex + ";" + endIndex + ";" + delta.action + ";" + delta.action + ";" + e.id + ";" + stringify(delta.lines)
                });
                if (delta.action == "insert") {
                    fixIndices(e, endIndex - startIndex, delta.action);
                }
            }
        }
    }
}

// Takes an index and reduces it by the sum of the lengths of
// unaccepted lengths before the index
var convertIndex = function(index) {
    var newIndex = index;
    editRef.once('value', function(snapshot) {
        snapshot.forEach(function(child) {
            var e = child.val();
            if (e.startIndex < index) {
                if (e.type == "insert") {
                    newIndex = newIndex - e.content.length;
                }
            }
        });
    });
    return newIndex;
}

// Reduces start and end indices by the length of an edit removed
// for all edits that appear after the edit being removed
var fixIndicesAfterRemovalAccept = function(index, length) {
    editRef.once('value', function(snapshot) {
        snapshot.forEach(function(child) {
            var e = child.val();
            if (e.startIndex >= index) {
                editRef.child(child.key).update({
                    startIndex: e.startIndex - length,
                    endIndex: e.endIndex - length
                });
            }
        });
    });
}

// This function is called once all users have accepted an edit.
var acceptEdit = function(editID) {
    var thisEdit = editRef.child(editID);
    thisEdit.update({ hasBeenAccepted: "true" });
    thisEdit.once('value', function(snapshot) {
        var e = snapshot.val();
        var index = convertIndex(e.startIndex);
        currentFile.once('value', function(childSnapshot) {
            var f = childSnapshot.val();
            var fileContent = f.fileContents;
            var prefix = fileContent.substring(0, index);
            var suffix = fileContent.substring(index);

            if (e.type == 'insert') {
                currentFile.update({
                    fileContents: prefix + e.content + suffix
                });
            } else {
                suffix = fileContent.substring(e.endIndex, fileContent.length);
                currentFile.update({
                    fileContents: prefix + suffix
                });
            }
            thisEdit.remove();
            fixIndicesAfterRemovalAccept(e.endIndex, e.content.length);
        });
    });
    alertSent = false;
}

/* Highlights the provided edit */
var highlight = function(edit) {
    if (edit.hid || fileMode == "base") {
        return;
    }
    var startRow = getRowColumnIndices(edit.start).row;
    var startColumn = getRowColumnIndices(edit.start).column;
    var endRow = getRowColumnIndices(edit.end).row;
    var endColumn = getRowColumnIndices(edit.end).column;
    if (edit.type == "insert") {
        edit.hid = editor.session.addMarker(new Range(startRow, startColumn, endRow, endColumn), "mark_green", "text");
    } else if (edit.type == "remove") {
        edit.hid = editor.session.addMarker(new Range(startRow, startColumn, endRow, endColumn), "mark_red", "text");
    }
}

/* Unhighlight the provided edit */
var unhighlight = function(edit) {
    if (edit.hid) {
        editor.session.removeMarker(edit.hid);
        edit.hid = null;
    }
}

/* Helper function for highlight */
var getLastColumnIndex = function(row) {
    return editor.session.getDocumentLastRowColumnPosition(row, 0).column;
}

/* Helper function for highlight */
var getLastColumnIndices = function() {
    var rows = editor.session.getLength();
    var lastColumnIndices = [];
    var lastColIndex = 0;
    for (var i = 0; i < rows; i++) {
        lastColIndex += getLastColumnIndex(i);
        if (i > 0) { lastColIndex += 1; }
        lastColumnIndices[i] = lastColIndex;
    }
    return lastColumnIndices;
};

/* Helper function for highlight */
var getRowColumnIndices = function(characterIndex) {
    var lastColumnIndices = getLastColumnIndices();
    if (characterIndex <= lastColumnIndices[0]) {
        return { row: 0, column: characterIndex };
    }
    var row = 1;
    for (var i = 1; i < lastColumnIndices.length; i++) {
        if (characterIndex > lastColumnIndices[i]) {
            row = i + 1;
        }
    }
    var column = characterIndex - lastColumnIndices[row - 1] - 1;
    return { row: row, column: column };
};


function loadEdits() {
    if (currentKey == undefined || currentKey == null) {
        console.log('No File Selected');
        return;
    }
    $('#edits').empty();
    let editHTML = '';
    let fileEdits = database.ref('files/' + currentKey + '/edits');
    let userNames = database.ref('users');
    var parentList = [];
    var childList = [];

    //for deletion
    let user = firebase.auth().currentUser;

    //for acceptance
    var numUsers;
    firebase.database().ref().child("files").child(currentKey)
        .child('userList').once("value", function(snapshot) {
            numUsers = snapshot.numChildren();
        });

    userNames.on('value', function(userData) {
		fileEdits.on('value', function(data) {

            for (i in data.val()) {
                // if (data.val()[i].hasBeenAccepted) {
                //     continue;
                // }
                if (!data.val()[i].parent) {
                    parentList.push({
                        'id': i,
                        'username': userData.val()[data.val()[i].user].username,
                        'content': data.val()[i].content,
                        'type': data.val()[i].type,
                        'last': data.val()[i].last
                    });
                } else {
                    childList.push({
                        'id': i,
                        'username': userData.val()[data.val()[i].user].username,
                        'content': data.val()[i].content,
                        'type': data.val()[i].type,
                        'last': data.val()[i].last,
                        'parent': data.val()[i].parent
                    });
                }
            }
            for (i in childList) {
                for (j in parentList) {
                    if (parentList[j].id == childList[i].parent) {
                        parentList[j].child = childList[i];
                        break;
                    }
                }
            }

            //create editHTML
            for (var i = 0; i < parentList.length; i++) {
                editVal = parentList[i];

                let eContent;
                if (editVal.content.length > 20) {
                    eContent = editVal.content.substring(0, 20);
                } else {
                    eContent = editVal.content;
                }

                var passing = getEditRef(editVal);

				var numAccepted;
			    firebase.database().ref().child("files").child(currentKey)
			        .child('edits').child(editVal.id).child('accepted').once("value", function(snapshot) {
			            numAccepted = snapshot.numChildren();
			    });

                let divContent = '<b>' + editVal.username + '</b>: ' + numAccepted + '/' + numUsers;
                var deleteEditBtn = "";
                if (user.uid == data.val()[editVal.id].user) {
                    deleteEditBtn = '<img class="delete" id="delete-edit-btn"  src="./img/close.png" ' +
                        'onclick="deleteEditById(\'' + editVal.id + '\')">';
                }

                
                let acceptButton = (readOnlyFile? "":'<label class="switch" ><input id="edit' + editVal.id + '" type="checkbox"' +
                    ' onclick="acceptTracker(\'' + editVal.id + '\', ' + numUsers + ')">' +
                    '<span class="slider round"></span></label>');

                let onClickLogic = 'ondblclick="openComment(\'' + editVal.id + '\');" ';


                if (editVal.type == 'insert') {
                    editHTML += '<div id="edit-add" class="edit" ' +
                        onClickLogic +
                        'oncontextmenu="admin(\'' + editVal.id + '\')" ' +
                        'onmouseover="editScrollandHighlight(\'' + editVal.id + '\')" ' +
                        'onmouseout="editUnhighlight(\'' + editVal.id + '\')">' +
                        divContent +
                        deleteEditBtn +
                        acceptButton +
                        '</div>\n';
                } else {
                    editHTML += '<div id="edit-remove" class="edit" ' +
                        onClickLogic +
                        'oncontextmenu="admin(\'' + editVal.id + '\')" ' +
                        // 'onmouseover="editScroll(\'' + editVal.id + '\')" ' +
                        'onmouseover="editScrollandDarkHighlight(\'' + editVal.id + '\')" ' +
                        'onmouseout="editDarkUnighlight(\'' + editVal.id + '\')">' +
                        divContent +
                        deleteEditBtn +
                        acceptButton +
                        '</div>\n';
                    // editHighlight(editVal.id);
                }

                if (editVal.last == user.uid) {
                    notifyLastUser(editVal, currentKey);
                }
                if (editVal.child) {
                    childVal = editVal.child;
                    let childContent;
                    if (childVal.content.length > 20) {
                        childContent = childVal.content.substring(0, 20);
                    } else {
                        childContent = childVal.content;
                    }
                    let childDiv = '<b>' + childVal.username + '</b>: ' + childContent;
                    if (childVal.type == 'insert') {


                        editHTML += '<div id="edit-add-child" class="edit"' +
                            onClickLogic +
                            'oncontextmenu="admin(\'' + editVal.id + '\')"' +
                            'onmouseover="editScrollandHighlight(\'' + childVal.id + '\')" ' +
                            'onmouseout="editUnhighlight(\'' + childVal.id + '\')">' +
                            childDiv + '</div>\n';
                    } else {
                        editHTML += '<div id="edit-remove-child" class="edit" ' +
                            onClickLogic +
                            'oncontextmenu="admin(\'' + editVal.id + '\')"' +
                            // 'onmouseover="editScroll(\'' + editVal.id + '\')" ' +
                            'onmouseover="editScrollandDarkHighlight(\'' + editVal.id + '\')" ' +
                            'onmouseout="editDarkUnighlight(\'' + editVal.id + '\')">' +
                            childDiv + '</div>\n';
                        // editHighlight(childVal.id);
                    }
                    if (editVal.last == user.uid) {
                        notifyLastUser(editVal.content, currentKey);
                    }
                }
            }

            //add edits to UI
            $('#edits').empty();
            $('#edits').append(editHTML);

            //set toggle states
            for (var i = 0; i < parentList.length; i++) {
                editVal = parentList[i];
                firebase.database().ref().child("files").child(currentKey).child('edits').child(editVal.id)
                    .child('accepted').orderByChild('id')
                    .equalTo(user.uid)
                    .once('value', function(snapshot) {
                        snapshot.forEach(function(childSnapshot) {
                            document.getElementById('edit' + editVal.id).checked = true;
                        });
                    });
            }

            //reset variables
            parentList = [];
            childList = [];
            editHTML = '';

        });
    });
}

var deleteEditById = function(editID) {
    var thisEdit = editRef.child(editID);
    thisEdit.once('value', function(snapshot) {
        var e = snapshot.val();
        var index = convertIndex(e.startIndex);
        currentFile.once('value', function(childSnapshot) {
            var f = childSnapshot.val();
            var fileContent = f.fileContents;
            var prefix = fileContent.slice(0, index);
            var suffix = fileContent.slice(index + 1);
            if (e.type == 'insert') {
                x_insert = true;
                thisEdit.remove();
                fixIndicesAfterRemovalAccept(e.endIndex, e.content.length);
            } else {
                thisEdit.remove();
            }
        });
    });
}

//add or remove user from accepted list in edit if toggle is clicked
function acceptTracker(edit, numUsers) {
    var accept = document.getElementById('edit' + edit);
    let user = firebase.auth().currentUser;

    if (accept.checked == true) {
        database.ref("/files/" + currentKey + "/edits/" + edit).on('value', function(data){
        	if (data.exists()){
	            if(data.val().last == user.uid) {
	                database.ref("/files/" + currentKey + "/edits/" + edit + "/last/").set(null);
	            }
	        }
        });
        firebase.database().ref().child("files")
            .child(currentKey).child('edits').child(edit).child('accepted').push({ 'id': user.uid });
        document.getElementById('edit' + edit).checked = true;
    } else {
        firebase.database().ref().child("files").child(currentKey).child('edits').child(edit)
            .child('accepted').orderByChild('id')
            .equalTo(user.uid)
            .once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    firebase.database().ref().child("files")
                        .child(currentKey).child('edits').child(edit)
                        .child('accepted').child(childKey).remove();
                });
            });
        document.getElementById('edit' + edit).checked = false;
    }
    
    var numAccepted;
    firebase.database().ref().child("files").child(currentKey)
        .child('edits').child(edit).child('accepted').once("value", function(snapshot) {
            numAccepted = snapshot.numChildren();
        });
	/*
    if (numAccepted >= numUsers) {
        acceptEdit(edit);
    }*/
    console.log('from acceptTracker()');
    checkAcceptanceCriteria(edit);

    if (numAccepted == numUsers-1) {
        sendNotification(edit);
    }
}

var sendNotification = function(editID) {
    let lastUserId = null;
    database.ref("/files/" + currentKey).on('value', function(data) {
        let listOfUsers = [];
        for(i in data.val().userList){
            listOfUsers.push(i);
        }

        let listOfAcceptedUsers = [];
        for(i in data.val().edits[editID].accepted){
            listOfAcceptedUsers.push(data.val().edits[editID].accepted[i].id);
        }

        for(i in listOfUsers) {
            if(!listOfAcceptedUsers.includes(listOfUsers[i])) {
                lastUserId = listOfUsers[i];
            }     
        }
        database.ref("files/" + currentKey + "/edits/" + editID + "/last").set(lastUserId);
    });
}

function editHighlight(id) {
    let hoveredEdit;
    for (i in edits) {
        if (edits[i].id == id) {
            hoveredEdit = edits[i];
        }
    }
    highlight(hoveredEdit);
}

function editUnhighlight(id) {
    var unHoveredEdit;
    for (i in edits) {
        if (edits[i].id == id) {
            unHoveredEdit = edits[i];
        }
    }
    unhighlight(unHoveredEdit);
}

function loadEditsIntoEditor() {
    editRef.once('value', function(data) {
        for (i in data.val()) {
            // Load contents of edit into editor
            if (data.val()[i].type == "insert") {
                global_ignore = true;
                var cursor = editor.getCursorPosition();
                var prefix = editor.session.getValue().slice(0, data.val()[i].startIndex);
                var suffix = editor.session.getValue().slice(data.val()[i].startIndex);
                editor.session.setValue(prefix + data.val()[i].content + suffix);
                editor.selection.moveTo(cursor.row, cursor.column);
                global_ignore = false;
            } else {
                editHighlight(i);
            }
        }
    });
}

function unhighlightAllRemovals() {
    for (i in edits) {
        if (edits[i].type == "remove") {
            unhighlight(edits[i]);
        }
    }
}

function highlightAllRemovals() {
    for (i in edits) {
        if (edits[i].type == "remove") {
            unhighlight(edits[i]);
            highlight(edits[i]);
        }
    }
}

highlightEditsByUser = function(userId) {
    for (i in edits) {
        if (edits[i].user == userId) {
            highlight(edits[i]);
        }
    }
}

unhighlightEditsByUser = function(userId) {
    for (i in edits) {
        if (edits[i].user == userId) {
            unhighlight(edits[i]);
        }
    }
}

editScrollandHighlight = function(editId) {
    editHighlight(editId);
    editScroll(editId);
}

editScrollandDarkHighlight = function(editId) {
    var tempEdit = getEditById(editId);
    var startRow = getRowColumnIndices(tempEdit.start).row;
    var startColumn = getRowColumnIndices(tempEdit.start).column;
    var endRow = getRowColumnIndices(tempEdit.end).row;
    var endColumn = getRowColumnIndices(tempEdit.end).column;
    DarkRemovalHighlight = editor.session.addMarker(new Range(startRow, startColumn, endRow, endColumn), "mark_red", "text");
    editScroll(editId);
}

editDarkUnighlight = function() {
    if (DarkRemovalHighlight) {
        editor.session.removeMarker(DarkRemovalHighlight);
        DarkRemovalHighlight = null;
    }
}

var editScroll = function(editId) {
    var row = 1;
    for (var i = 0; i < edits.length; i++) {
        if (edits[i].id == editId) {
            row = getRowColumnIndices(edits[i].start).row;
        }
    }
    editor.scrollToLine(row, true, true, function() {});
}

var notifyLastUser = function(edit, file) {
    database.ref("/files/" + currentKey + "/edits/" + edit.id + "accepted").on('value', function(data){
        for(i in data.val()){
            if(data.val()[i].id == user.uid) {
                return;
            }
        }   
    });
    editScrollandHighlight(edit.id);
    if(alertSent) {
        return;
    }
    alert("You are the last person not to make a decison on edit:\n" + edit.content);
}