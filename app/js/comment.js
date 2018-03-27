var userInput;

var editR;

var openComment = function(glo_e) {
    //does not open comment box when accept toggle is clicked
    if (!e) var e = window.event;
    if (!e.target.matches('.edit')){
        return;
    }
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

