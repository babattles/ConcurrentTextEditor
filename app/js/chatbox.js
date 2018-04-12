$(document).ready(function () {
    // Minimizes chatbox if you click on it
    $("#chatLabel").click(function () {
        $("#chat").toggle();
        $("#chatInput").toggle();
    });

    // Triggered for "Enter" key press
    $("#chatInput").keydown(function (event) {
        if (event.keyCode === 13) {
            postMessage(this.value);
            this.value = '';
            return false;
        }
    });

    $("#channel").change(function () {
        loadMessages($(this).val());
    });
});

var messageRef = null;
var listeningForMessages = {};

// Loads 10 most recent messages from database on file load
var loadMessages = function (chan) {
    messageRef = currentFile.child("messages").child(chan);
    var chat = document.getElementById("chat");
    while (chat.firstChild) {
        chat.removeChild(chat.firstChild);
    }
    if (!listeningForMessages[messageRef]) {
        messageRef.on("child_added", function (snapshot) {
            var div = document.createElement("div");
            var para = document.createElement("p");
            var content = snapshot.val().content;
            var message_user = snapshot.val().user;
            var node = document.createTextNode(message_user + ": " + content);
            para.appendChild(node);
            div.appendChild(para);
            chat.appendChild(div);
        });
        listeningForMessages[messageRef] = true;
    } else {
        messageRef.once("value", function (snapshot) {
            snapshot.forEach(function (child) {
                var div = document.createElement("div");
                var para = document.createElement("p");
                var content = child.val().content;
                var message_user = child.val().user;
                var node = document.createTextNode(message_user + ": " + content);
                para.appendChild(node);
                div.appendChild(para);
                chat.appendChild(div);
            })
        });
    }
}

// Loads the channels
var loadChannels = function () {
    $("#channel").empty();
    var dd = document.getElementById("channel");
    currentFile.child("messages").once("value", function (snapshot) {
        snapshot.forEach(function (child) {
            var option = document.createElement("option");
            option.text = child.key;
            option.id = child.key;
            dd.add(option);
        });
    });
    loadMessages("General");
}

// Function that posts the message to the database
var postMessage = function (content) {
    if (messageRef) {
        messageRef.push({
            content: content,
            user: global_username,
        });
    }
}