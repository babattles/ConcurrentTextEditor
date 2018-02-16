'use strict';

var editor = ace.edit("editor");
//editor.setSession(js);
//editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
//Hide margin
editor.setShowPrintMargin(false);
//Hide line number
editor.renderer.setShowGutter(false);

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

