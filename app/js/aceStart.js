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
editor.commands.addCommand({
    name: 'fontIncrease',
    bindKey: { win: 'Ctrl-9', mac: 'Command-9' },
    exec: function(editor) {
        fontSize++;
        document.getElementById('editor').style.fontSize = fontSize + "px";
    },
});
editor.commands.addCommand({
    name: 'fontDecrease',
    bindKey: { win: 'Ctrl-0', mac: 'Command-0' },
    exec: function(editor) {
        fontSize--;
        document.getElementById('editor').style.fontSize = fontSize + "px";
    },
});
var fontListenerI = document.getElementById("fontIncrease");
//listeners for font increase/decrease
fontListenerI.addEventListener('click', function() {
    fontSize++;
    document.getElementById('editor').style.fontSize = fontSize + "px";
});
var fontListenerD = document.getElementById("fontDecrease");
fontListenerD.addEventListener('click', function() {
    fontSize--;
    document.getElementById('editor').style.fontSize = fontSize + "px";
});

function syntax() {
    document.getElementById("SyntaxDropdown").classList.toggle("show");
}

function enable_javascript() {
    editor.session.setMode("ace/mode/javascript");
}

function enable_html() {
    editor.session.setMode("ace/mode/html");
}

function enable_css() {
    editor.session.setMode("ace/mode/css");
}