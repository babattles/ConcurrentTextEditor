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

    $("#channel").change(function() {
        loadMessages();
    });
});

var messageRef = null;

// Loads 10 most recent messages from database on file load
var loadMessages = function() {
    messageRef = currentFile.child("messages").child(document.getElementById('channel').value);
}

// Loads the channels
var loadChannels = function() {
    $("#channel").empty();
    var dd = document.getElementById("channel");
    currentFile.child("messages").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            var option = document.createElement("option");
            option.text = child.key;
            option.id = child.key;
            dd.add(option); 
        });
    }).then({loadMessages});
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