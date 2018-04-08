var userInput;

var editR;

var commentPanel = document.getElementById('Comment');
var commentInput = document.getElementById('comment-input');
var comment_span = document.getElementById('comment-span');

clearComment = function() {
    commentInput.value = '';
}

var openComment = function(edit) {
    //does not open comment box when accept toggle is clicked
    x = edit;
    //console.log(x);
    clearComment();
    commentPanel.classList.toggle("hidden");
    x.once('value', function(snapshot) {
        if (snapshot.val().comment) {
        comment_span.innerHTML = "Comment: " + snapshot.val().comment;
        } else {
            comment_span.innerHTML = "Comment: ";
        }
    });
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

