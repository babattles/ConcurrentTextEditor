'use strict';

var editor = ace.edit("editor");
//editor.setSession(js);
//editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
//Hide margin
editor.setShowPrintMargin(false);
//Hide line number
editor.renderer.setShowGutter(false);