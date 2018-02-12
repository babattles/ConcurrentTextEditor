const electron = require('electron');
const dialog = require('electron').remote.dialog
var currentFileName = 'untitled';
var currentFileType = '';

document.querySelector('#openedFile').onchange = function() {
    var file = document.getElementById('openedFile').files[0];
    if (file) {
        currentFileName = file.name;
        currentFileType = file.type;
        var fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = function loaded(evt) {
            var fileString = evt.target.result;
            document.getElementById('temptextarea').textContent = fileString;
            // TODO, for now logs file contents to console, but can easily update ace with following line
            // document.getElementById('ace-editor').textContent = fileString;
        }
    }
};

document.querySelector('#saveOpenedFile').onclick = function() {
    var textToSave = document.getElementById("temptextarea").value; //TODO would be ace value
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    // var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;
    var fileNameToSaveAs = currentFileName + currentFileType;
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = function() {
        document.body.removeChild(event.target);
    }
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink); 
    downloadLink.click();
}