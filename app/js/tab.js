//Tab Functionality
var tabs = [];
$(document).ready(function(){
    $('#new-tab').click(function(){
    	addTab();
    });
});

var addTab = function() {
	tabs.push('New Tab' + (tabs.length==0?'':tabs.length));
	updateTabs();
}

var updateTabs = function () {
	var tabHTML = '';
	for (i in tabs) {
		 tabHTML += '<td class="tab">' + tabs[i] + '</td>\n';
	}
	$('#tabs').empty();
	$('#tabs').append(tabHTML);
}