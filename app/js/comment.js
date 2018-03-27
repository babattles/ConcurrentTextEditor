var userInput;

var x;

var name = location.href.split("/").slice(-1); 
//console.log(f);
if (name == "comment.html") {
    var config = {
    apiKey: "AIzaSyAr4i-0nzmJi9x2bwyJXqQPjsPJfkeN0V0",
    authDomain: "hivetext-dcadf.firebaseapp.com",
    databaseURL: "https://hivetext-dcadf.firebaseio.com",
    projectId: "hivetext-dcadf",
    storageBucket: "hivetext-dcadf.appspot.com",
    messagingSenderId: "254482798300"
    };
    firebase.initializeApp(config); 
    var db = firebase.database();
}

var commentPanel = document.getElementById('Comment');
var commentInput = document.getElementById('comment-input');

clearComment = function() {
    commentInput.value = '';
}

var openComment = function(edit) {
    //console.log("testOK");
    x = edit;
    //console.log(x);
    clearComment();
    commentPanel.classList.toggle("hidden");
    //var db = firebase.database();
    //window.open ('comment.html?parameter=' + x);
}

changeCommentBtn.addEventListener("click", function() {
    commentPanel.classList.toggle("hidden");
    userInput = document.getElementById("comment-input").value;
    x.update ({
         comment: userInput
    })
});




function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    //console.log(url);
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


