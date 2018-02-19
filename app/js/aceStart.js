'use strict';

var editor = ace.edit("editor");
var fontSize = 12;
document.getElementById('editor').style.fontSize = '12px';
editor.setTheme("ace/theme/ambiance");
editor.session.setMode("ace/mode/javascript");
//Hide margin
editor.setShowPrintMargin(false);
//Show line number
editor.renderer.setShowGutter(true);
//Start blank
editor.setValue('', -1);

//listeners for font increase/decrease
function fontIncrease() {
    fontSize++;
    document.getElementById('editor').style.fontSize = fontSize + "px";
}

function fontDecrease() {
    fontSize--;
    document.getElementById('editor').style.fontSize = fontSize + "px";
}

var fontListenerI = document.getElementById("fontIncrease");
fontListenerI.addEventListener('click', function() {
    fontIncrease();
});

var fontListenerD = document.getElementById("fontDecrease");
fontListenerD.addEventListener('click', function() {
    fontDecrease();
});

function syntax() {
    document.getElementById("SyntaxDropdown").classList.toggle("show");
}