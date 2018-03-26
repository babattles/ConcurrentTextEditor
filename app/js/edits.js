var Range = ace.require("ace/range").Range;

var edits = [];

// Retrieve new edits as they are added to the database (including your own!)
var getEdits = function () {
	editRef.on("child_added", function (snapshot, prevChildKey) { // prevChildKey is the key of the last child added (we may need it, idk but it's there)
		var e = snapshot.val();
		edits.push({
			start: e.startIndex,
			end: e.endIndex,
			content: e.content,
			type: e.type,
			user: e.user,
			id: snapshot.key,
		});
		checkConcurrency(e);
	});

	// update local edit array when edits are changed on the database
	editRef.on("child_changed", function (snapshot) {
		var changedEdit = snapshot.val();
		edits.find((obj, index) => {
			if (obj.id == snapshot.key && (obj.start != changedEdit.startIndex || obj.end != changedEdit.endIndex)) {
				edits[index] = {
					start: changedEdit.startIndex,
					end: changedEdit.endIndex,
					content: changedEdit.content,
					type: changedEdit.type,
					user: changedEdit.user,
					id: snapshot.key,
				};
			}
		})
		checkConcurrency(changedEdit);
	});
}

/* helper function */
// Returns an array of strings as a single multi-line string
var stringify = function (lines) {
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
var clearEdits = function () {
	edits.splice(0, edits.length);
}

/* Helper - Get the database reference for an edit */
var getEditRef = function (edit) {
	if (editRef == null) return null;
	return editRef.child("" + edit.id);
}

/* Post a new edit to the database */
var postEdit = function (edit) {
	var newEdit = editRef.push(); // generate a new edit
	newEdit.set({
		'startIndex': edit.start,
		'endIndex': edit.end,
		'content': edit.content,
		'type': edit.type,
		'user': edit.user
	});
	edit.id = newEdit.key;
}

/* Update your existing edit in the database */
var updateEdit = function (edit) {
	var ref = getEditRef(edit);
	return ref.update({
		content: edit.content,
		endIndex: edit.end,
		startIndex: edit.start
	});
}

/* Delete an edit from the database */
var deleteEdit = function (edit) {
	var ref = getEditRef(edit);
	return ref.remove();
}

/* Fixes indecies for all edits after current edit */
// edit is the updated/new edit
// size is the amount to increase all other edits by
var fixIndices = function (edit, size, type) {
	editRef.once('value', function (snapshot) {
		snapshot.forEach(function (child) {
			var e = child.val();
			if (e.startIndex > edit.end) {
				if (type == "insert") {
					child.ref.update({
						startIndex: e.startIndex + size,
						endIndex: e.endIndex + size,
					});
				} else if (type == "remove") {
					child.ref.update({
						startIndex: e.startIndex - size,
						endIndex: e.endIndex - size,
					});
				}
			}
		});
	});
}

/* Rewrite a "remove" type edit */
// TODO: Highlight this as a color (red)
var rewriteRemoved = function (edit) {

}

/* Take a startIndex, endIndex, and the change, and make an edit */
var setEdit = function (startIndex, endIndex, delta) {
	// get the current user
	var user = firebase.auth().currentUser;
	if (user) {
		var bool = 0;
		bool = edits.find((obj, index) => {
			if (obj.start < startIndex && startIndex < obj.end && delta.action == "insert" && obj.type == "insert") { // new addition was within an existing edit
				//console.log("added within");
				edits[index].content = obj.content.substring(0, startIndex - obj.start) + stringify(delta.lines) + obj.content.substring(startIndex - obj.start, obj.content.length);
				edits[index].start = obj.start;
				edits[index].end = obj.end + (endIndex - startIndex);
				edits[index].type = delta.action;
				edits[index].user = user.uid;
				updateEdit(edits[index]);
				fixIndices(edits[index], endIndex - startIndex, delta.action);
				return true; // stop searching
			} else if (obj.start == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the beginning of an existing edit
				//console.log("added to beginning");
				edits[index].start = startIndex;
				edits[index].end = obj.end + (endIndex - startIndex);
				edits[index].content = stringify(delta.lines) + obj.content;
				edits[index].type = delta.action;
				edits[index].user = user.uid;
				updateEdit(edits[index]);
				fixIndices(edits[index], endIndex - startIndex, delta.action);
				return true;
			} else if (obj.end == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the end of an existing edit
				//console.log("added to end");
				edits[index].start = obj.start;
				edits[index].end = endIndex;
				edits[index].content = obj.content + stringify(delta.lines);
				edits[index].type = delta.action;
				edits[index].user = user.uid;
				updateEdit(edits[index]);
				fixIndices(edits[index], endIndex - startIndex, delta.action);
				return true;
			} else if (obj.start > startIndex && obj.end < endIndex && delta.action == "remove") { // removed an edit as well as content on both sides
				//console.log("edit and both sides");
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
				//console.log("remove edit and right side");
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
					updateEdit(edits[index]);
					fixIndices(edits[index], obj.end - startIndex, delta.action);
				}
				postEdit(e);
				return true;
			} else if (obj.start > startIndex && obj.end >= endIndex && endIndex > obj.start && delta.action == "remove") { // removed some or all of an edit as well as content on the left side
				//console.log("remove edit and left");
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
					updateEdit(edits[index]);
					fixIndices(edits[index], startIndex - obj.start, delta.action);
				}
				postEdit(e);
				return true;
			} else if (obj.start <= startIndex && endIndex <= obj.end && delta.action == "remove" && obj.type == "insert") { // removed something from within an edit
				//console.log("remove from within");
				if (obj.start == startIndex && obj.end == endIndex) { // you're deleting the last of an edit
					//console.log("That's the last of em!");
					fixIndices(edits[index], edits[index].end - edits[index].start, delta.action);
					deleteEdit(edits[index]);
					edits.splice(index, 1);
				} else {
					//console.log("Not really an insert");
					edits[index].content = obj.content.substring(0, startIndex - obj.start) + obj.content.substring(endIndex - obj.start, obj.content.length);
					edits[index].start = obj.start;
					edits[index].end = obj.end - (endIndex - startIndex);
					edits[index].type = "insert";
					edits[index].user = user.uid;
					updateEdit(edits[index]);
					fixIndices(edits[index], endIndex - startIndex, delta.action);
				}
				return true;
			}
		});
		// never found parent edit, so add edit to edits
		if (!bool) {
			//console.log("no parent");
			var e = {
				start: startIndex,
				end: endIndex,
				content: stringify(delta.lines),
				type: delta.action,
				user: user.uid,
			}
			postEdit(e);
			fixIndices(e, endIndex - startIndex, delta.action);
		}
	}
}

// Takes an index and reduces it by the sum of the lengths of
// unaccepted lengths before the index
var convertIndex = function(index) {
	var newIndex = index;
	editRef.once('value', function (snapshot) {
		snapshot.forEach(function (child) {
			var e = child.val();
			if (e.startIndex < index) {
				if (e.type == "insert") {
					// console.log(e.content.length);
					newIndex = newIndex - e.content.length;
				}
			}
		});
	});
	return newIndex;
}

// Reduces start and end indices by the lenght of an edit removed
// for all edits that appear after the edit being removed
var fixIndicesAfterRemovalAccept = function(index, length) {
	editRef.once('value', function (snapshot) {
		snapshot.forEach(function (child) {
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
	thisEdit.once('value', function (snapshot) {
		var e = snapshot.val();
		// console.log("Index before = " + e.startIndex);
		var index = convertIndex(e.startIndex);
		// console.log("Index after = " + index)
		currentFile.once('value', function (childSnapshot) {
			var f = childSnapshot.val();
			var fileContent = f.fileContents;
			// console.log(fileContent);
			var prefix = fileContent.substring(0, index);
			// console.log("prefix = " + prefix);
			var suffix = fileContent.substring(index);
			// console.log("suffix = " + suffix);

			if (e.type == 'insert') {
				currentFile.update({
					fileContents: prefix + e.content + suffix
				});
			} else {
				suffix = fileContent.substring(e.endIndex, fileContent.length);
				currentFile.update({
					fileContents: prefix + suffix
				});
				fixIndicesAfterRemovalAccept(e.endIndex, e.content.length);
			}
			thisEdit.remove();

			//TODO remove highlighting from the file (once highlighting is implemented)
		});
	});
}

/* Highlights the provided edit */
var highlight = function(edit) {
	var startRow = getRowColumnIndices(edit.start).row;
	var startColumn = getRowColumnIndices(edit.start).column;
	var endRow = getRowColumnIndices(edit.end).row;
	var endColumn = getRowColumnIndices(edit.end).column;
	console.log("setting marker at " + startRow + " " + startColumn + " and " + endRow + " " + endColumn);
	if (edit.type == "insert") {
		editor.session.addMarker(new Range(startRow, startColumn, endRow, endColumn), "mark_green", "text");
	} else if (edit.type == "remove") {
		editor.session.addMarker(new Range(startRow, startColumn, endRow, endColumn), "mark_red", "text");
	}
}

/* Helper function for highlight */
var getLastColumnIndex = function (row) {
	return editor.session.getDocumentLastRowColumnPosition(row, 0).column;
}

/* Helper function for highlight */
var getLastColumnIndices = function () {
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
var getRowColumnIndices = function (characterIndex) {
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
	if(currentKey == undefined) {
		console.log('No File Selected');
		return;
	} 
	$('#edits').empty();
	let editHTML = '';
	let fileEdits = database.ref('files/' + currentKey + '/edits');
	let userNames = database.ref('users');
	var parentList = [];
	var childList = [];
	userNames.on('value', function(userData){
		fileEdits.on('value', function(data){
			for(i in data.val()) {
				if(!data.val()[i].parent) {
					parentList.push({
					 	'id': i,
					 	'username': userData.val()[data.val()[i].user].username,
					 	'content': data.val()[i].content,
					 	'type': data.val()[i].type
					});

				} else {
					childList.push({
					 	'id': i,
					 	'username': userData.val()[data.val()[i].user].username,
					 	'content': data.val()[i].content,
					 	'type': data.val()[i].type,
					 	'parent': data.val()[i].parent
					});
				}
			}
			for(i in childList) {
				for (j in parentList) {
					if(parentList[j].id == childList[i].parent) {
						parentList[j].child = childList[i];
						break;
					}
				}
			}
			for(var i = 0; i < parentList.length; i++) {
				editVal = parentList[i];
				let eContent;
				if(editVal.content.length > 20) {
					eContent = editVal.content.substring(0, 20);
				}
				else {
					eContent = editVal.content;
				}
				let divContent = '<b>' + editVal.username + '</b>: ' + eContent;
				if(editVal.type == 'insert') {
					editHTML += '<div id="edit-add" class="edit" onmouseover="editHover(\''
					 + editVal.id + 
					 '\')">' + divContent + '</div>\n';						
				} else {
					editHTML += '<div id="edit-remove" class="edit" onmouseover="editHover(\''
					 + editVal.id + 
					 '\')">' + divContent + '</div>\n';
				}
				if(editVal.child) {
					childVal = editVal.child;
					let childContent;
					if(childVal.content.length > 20) {
						childContent = childVal.content.substring(0, 20);
					}
					else {
						childContent = childVal.content;
					}
					let childDiv = '<b>' + childVal.username + '</b>: ' + childContent;
					if(childVal.type == 'insert') {
						editHTML += '<div id="edit-add-child" class="edit" onmouseover="editHover(\'' + childVal.id + '\')">' + childDiv + '</div>\n';						
					} else {
						editHTML += '<div id="edit-remove-child" class="edit" onmouseover="editHover(\'' + childVal.id + '\')">' + childDiv + '</div>\n';
					}
				}
			}
			$('#edits').empty();
			$('#edits').append(editHTML);
			parentList = [];
			childList = [];
			editHTML = '';	
		});
	});
}

function editHover(id) {
	let hoveredEdit;
	for(i in edits) {
		if(edits[i].id == id) {
			hoveredEdit = edits[i];
		}
	}
	highlight(hoveredEdit);
}