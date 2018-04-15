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
        messageRef.off("child_added");
        message_count = 0;
        max_message_count = 10;
        loadMessages($(this).val());
    });

    $("#seeMore").click(function () {
        messageRef.off("child_added");
        max_message_count += 10;
        message_count = 0;
        loadMessages($("#channel").val());
    });

    $("#addChannel").click(function () {
        var chat = document.getElementById("chat-container");
        var btn = document.createElement("button");
        var text = document.createElement("textarea");
        btn.onclick = function () {
            currentFile.child("messages").child("~" + text.value).push({
                content: "Welcome to your new channel, " + text.value + "!",
                user: "HiveText",
            });
            chat.removeChild(text);
            chat.removeChild(btn);
        };
        btn.innerHTML = "Add New Channel";
        chat.appendChild(text);
        chat.appendChild(btn);
    });
});

var messageRef = null;
var message_count = 0;
var max_message_count = 10;

// Loads 10 most recent messages from database on file load
var loadMessages = function (chan) {
    var dd = document.getElementById("channel");
    for (var i = 0; i < dd.options.length; i++) {
        if (dd.options[i].text == chan) {
            dd.options[i].selected = true;
            break;
        }
    }
    messageRef = currentFile.child("messages").child(chan);
    var chat = document.getElementById("chat");
    while (chat.firstChild) {
        chat.removeChild(chat.firstChild);
    }
    messageRef.on("child_added", function (snapshot) {
        if (message_count >= max_message_count && chat.firstChild) {
            chat.removeChild(chat.firstChild);
            message_count--;
        }
        var div = document.createElement("div");
        var para = document.createElement("p");
        var content = snapshot.val().content;
        var message_user = snapshot.val().user;
        var node = document.createTextNode(message_user + ": " + content);
        para.appendChild(node);
        div.appendChild(para);
        chat.appendChild(div);
        message_count++;
    });
}

// Loads the channels
var loadChannels = function () {
    $("#channel").empty();
    var dd = document.getElementById("channel");
    currentFile.child("messages").on("child_added", function (child) {
        var option = document.createElement("option");
        option.text = child.key;
        option.id = child.key;
        dd.add(option);
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