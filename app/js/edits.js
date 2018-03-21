//Makes edit disappear when you approve it
$(document).ready(function () {
	$(".edit").click(function () {
		// console.log(this.innerHTML);
		var confirmation = confirm("Are you sure you want to accept this edit?\n\n" + this.innerHTML);
		if (confirmation === true) {
			this.style.display = 'none';

			//INSERT CODE FOR MAKING EDIT PERMANENT HERE

		}
	});
});

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
var fixIndecies = function (edit, size, type) {
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
				fixIndecies(edits[index], endIndex - startIndex, delta.action);
				return true; // stop searching
			} else if (obj.start == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the beginning of an existing edit
				//console.log("added to beginning");
				edits[index].start = startIndex;
				edits[index].end = obj.end + (endIndex - startIndex);
				edits[index].content = stringify(delta.lines) + obj.content;
				edits[index].type = delta.action;
				edits[index].user = user.uid;
				updateEdit(edits[index]);
				fixIndecies(edits[index], endIndex - startIndex, delta.action);
				return true;
			} else if (obj.end == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the end of an existing edit
				//console.log("added to end");
				edits[index].start = obj.start;
				edits[index].end = endIndex;
				edits[index].content = obj.content + stringify(delta.lines);
				edits[index].type = delta.action;
				edits[index].user = user.uid;
				updateEdit(edits[index]);
				fixIndecies(edits[index], endIndex - startIndex, delta.action);
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
				fixIndecies(edits[index], obj.end - obj.start, delta.action);
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
					fixIndecies(edits[index], edits[index].end - edits[index].start, delta.action);
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
					fixIndecies(edits[index], obj.end - startIndex, delta.action);
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
					fixIndecies(edits[index], edits[index].end - edits[index].start, delta.action);
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
					fixIndecies(edits[index], startIndex - obj.start, delta.action);
				}
				postEdit(e);
				return true;
			} else if (obj.start <= startIndex && endIndex <= obj.end && delta.action == "remove" && obj.type == "insert") { // removed something from within an edit
				//console.log("remove from within");
				if (obj.start == startIndex && obj.end == endIndex) { // you're deleting the last of an edit
					//console.log("That's the last of em!");
					fixIndecies(edits[index], edits[index].end - edits[index].start, delta.action);
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
					fixIndecies(edits[index], endIndex - startIndex, delta.action);
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
			fixIndecies(e, endIndex - startIndex, delta.action);
		}
	}
}