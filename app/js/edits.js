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

var clearEdits = function () {
	edits.splice(0, edits.length);
}

var setEdit = function (startIndex, endIndex, delta) {
	// get the current user
	var user = firebase.auth().currentUser;
	if (user) {
		var bool = 0;
		bool = edits.find((obj, index) => {
			if (obj.start < startIndex && startIndex < obj.end && delta.action == "insert" && obj.type == "insert") { // new addition was within an existing edit
				console.log("added within");
				edits[index] = {
					start: obj.start,
					end: obj.end + (endIndex - startIndex),
					content: obj.content.substring(obj.start, startIndex) + stringify(delta.lines) + obj.content.substring(startIndex, obj.end),
					type: delta.action,
					user: user.uid,
				}; //TODO: content add
				return true; // stop searching
			} else if (obj.start == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the beginning of an existing edit
				console.log("added to beginning");
				edits[index] = {
					start: startIndex,
					end: obj.end + (endIndex - startIndex),
					content: stringify(delta.lines) + obj.content,
					type: delta.action,
					user: user.uid,
				};
				return true;
			} else if (obj.end == startIndex && delta.action == "insert" && obj.type == "insert") { // new addition was at the end of an existing edit
				//console.log("added to end");
				edits[index] = {
					start: obj.start,
					end: endIndex,
					content: obj.content + stringify(delta.lines),
					type: delta.action,
					user: user.uid,
				};
				return true;
			//} else if (obj.start > startIndex && obj.end < endIndex && delta.action == "remove") { // removed an edit as well as content on both sides

			//} else if () { // removed an edit as well as content on the right side

			//} else if () { // removed an edit as well as content on the left side
				
			} else if (obj.start <= startIndex && endIndex <= obj.end && delta.action == "remove") { // removed something from within an edit
				//console.log("remove from within");
				if (obj.start == startIndex && obj.end == endIndex) { // you're deleting the last of an edit
					console.log("That's the last of em!");
					edits.splice(index, 1);
				} else {
					console.log("Not really an insert"); 
					edits[index] = {
						start: obj.start,
						end: obj.end - (endIndex - startIndex),
						content: obj.content.substring(obj.start, startIndex) + obj.content.substring(endIndex, obj.end),
						type: "insert",
						user: user.uid,
					};
				}
				return true;
			}
		});
		// never found parent edit, so add edit to edits
		if (!bool) {
			console.log("no parent");
			edits.push({
				start: startIndex,
				end: endIndex,
				content: stringify(delta.lines),
				type: delta.action,
				user: user.uid,
			});
		}
	}
}