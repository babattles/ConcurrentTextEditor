'use strict';

var editor = ace.edit("editor");
var fontSize = 12;
var lineNumberCurr = true;

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


function lineNumber() {
	if (lineNumberCurr) {
		lineNumberCurr = false;
	}
	else {
		lineNumberCurr = true;
	}
	editor.renderer.setOption('showLineNumbers', lineNumberCurr);
}