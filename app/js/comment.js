var userInput;

var x;

var openComment = function(edit) {
    //console.log("testOK");
    x = edit;
    console.log(x);
    window.open ('comment.html');
}

var acceptComment = function(x) {
    //console.log("accepted");
    userInput = document.getElementById("userInput").value;
    console.log(x);
    updateComment(x);
}

var updateComment = function (editRef) {
	var ref = editRef.id;
	console.log(ref);
	return ref.update({
		comment: userInput
	});
}

