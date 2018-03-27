var userInput;

var editR;

var openComment = function(glo_e) {
    console.log("testOK");
    editR = glo_e;
    window.open ('comment.html');
}

var acceptComment = function() {
    console.log("accepted");
    userInput = document.getElementById("userInput").value;
    console.log(userInput);
    updateComment(editR);
}

var updateComment = function (edit) {
	var ref = edit;
	console.log(userInput);
	return ref.update({
		comment: userInput
	});
}

