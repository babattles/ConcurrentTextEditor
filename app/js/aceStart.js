'use strict';

var editor = ace.edit("editor");
var fontSize = 14;
var lineNumberCurr = true;
var minFont = 10;
var maxFont = 150;
var increaseFont = fontSize / 8;
var decreaseFont = increaseFont;
document.getElementById('editor').style.fontSize = fontSize + "px";
editor.setTheme("ace/theme/ambiance");
//Hide margin
editor.setShowPrintMargin(false);
//Show line number
editor.renderer.setShowGutter(true);
//Start blank
editor.setValue('', -1);

//listeners for font increase/decrease
function fontIncrease() {
    if (fontSize < maxFont) {
        if ((maxFont - fontSize) < increaseFont) {
            increaseFont = maxFont - fontSize;
        }
        fontSize += increaseFont;
        document.getElementById('editor').style.fontSize = fontSize + "px";
    }
}

function fontDecrease() {
    if (fontSize > minFont) {
        if ((fontSize - minFont) < decreaseFont) {
            decreaseFont = fontSize - minFont;
        }

        fontSize -= decreaseFont;
        document.getElementById('editor').style.fontSize = fontSize + "px";
    }
}

function fontReset() {
    fontSize = 14;
    document.getElementById('editor').style.fontSize = 14 + "px";
}


function lineNumber() {
    if (lineNumberCurr) {
        lineNumberCurr = false;
    } else {
        lineNumberCurr = true;
    }
    editor.renderer.setOption('showLineNumbers', lineNumberCurr);
}