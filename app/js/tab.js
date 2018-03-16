//Tab Functionality
var tabs = [];
$(document).ready(function(){
    $('#new-tab').click(function(){
    	addTab();
    });
});

var addTab = function(filename) {
	tabs.push(filename);
	updateTabs();
}

var switchTab = function(args) {
    var target = -1;
    for (i in tabs) {
    	if(tabs[i] == args.innerHTML) {
    		target = i;
    		break;
    	}
    }
    if(target != -1) {
    	updateTabs(target);
    }
}

var updateTabs = function (activeTab) {
	if(typeof activeTab == 'undefined') {
		activeTab = tabs.length-1;
	}
	var tabHTML = '';
	for (i in tabs) {
		if(i == activeTab) {
			tabHTML += '<div id="activeTab" class="tab rTableCell" onclick=\"switchTab(this)\">' + tabs[i] + '</div>\n';			
		} else {
			tabHTML += '<div class="tab rTableCell" onclick=\"switchTab(this)\">' + tabs[i] + '</div>\n';
		}
	}
	$('#tabs').empty();
	$('#tabs').append(tabHTML);
}