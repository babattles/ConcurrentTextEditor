var userInput;

var editR;

var commentPanel = document.getElementById('Comment');
var commentInput = document.getElementById('comment-input');

clearComment = function() {
    commentInput.value = '';
}

var openComment = function(glo_e) {
    //does not open comment box when accept toggle is clicked
    if (!e) var e = window.event;
    if (!e.target.matches('.edit')){
        return;
    }
    clearComment();
    commentPanel.classList.toggle("hidden");
}

changeCommentBtn.addEventListener("click", function() {
    commentPanel.classList.toggle("hidden");
    userInput = document.getElementById("comment-input").value;
    x.update ({
         comment: userInput
    })
});

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

