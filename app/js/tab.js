//Tab Functionality
var tabs = [];
$(document).ready(function(){
    $("#new-tab").click(function(){
		tabs.push("New Tab" + (tabs.length==0?"":tabs.length));
		updateTabs();
		console.log(tabs);
    });
});

var updateTabs = function () {
	
}