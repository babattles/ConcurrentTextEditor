var userInput;

var x;

var openComment = function(edit) {
    //console.log("testOK");
    x = edit;
    console.log(x);
    window.open ('comment.html?parameter=' + x);
}

var acceptComment = function(x) {
    //console.log("accepted");
    userInput = document.getElementById("userInput").value;
    //window.close();
    console.log(userInput);

    var para = getParameterByName('parameter');
    //console.log(para);
    updateComment(para);
}

var updateComment = function (editRef) {
	var ref = editRef;
	console.log(ref);
    
	return ref.update({
		comment: userInput
	});
}

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


