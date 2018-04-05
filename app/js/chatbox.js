$(document).ready(function(){
    // Minimizes chatbox if you click on it
    $("#chatLabel").click(function(){
    	$("#chat").toggle();
    	$("#chatInput").toggle();
    });

    // Triggered for "Enter" key press
    $("#chatInput").keydown(function(event) {
        if (event.keyCode === 13) {
            postMessage(this.value);
            this.value = '';
            return false;
        }
    });
});

var messageRef = null;

// Loads 10 most recent messages from database on file load
var loadMessages = function() {
    messageRef = currentFile.child("messages");

    // Do more
}

// Function that posts the message to the database
var postMessage = function(content) {
    if (messageRef) {
        messageRef.push({
            content: content,
            user: global_user.uid,
        });
    }
}