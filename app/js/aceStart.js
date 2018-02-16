'use strict';

var editor = ace.edit("editor");
editor.setTheme("ace/theme/ambiance");
editor.session.setMode("ace/mode/javascript");
//Hide margin
editor.setShowPrintMargin(false);
//Show line number
editor.renderer.setShowGutter(true);
//Start blank
editor.setValue('', -1);

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