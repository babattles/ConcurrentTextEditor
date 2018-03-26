
var testFunction = function() {
    console.log("testOK");
    window.open ('comment.html');
}

var acceptComment = function() {
    console.log("accepted");
    var userInput = document.getElementById("userInput").value;
    console.log(userInput);
}