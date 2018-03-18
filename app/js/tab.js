//Tab Functionality
var tabs = [];

//Variable that keep tracking previous tab
var lastTab;

//Array to store the content of each tab
var sessions = [];

$(document).ready(function(){
    $('#new-tab').click(function(){
    	addTab();
    });
});

//Add a new tab
var addTab = function(filename) {
	//Create a new tab 
	tabs.push(filename);
	
	//Update content of the tab
	sessions.push(editor.getValue());

	//Update lastTab
	lastTab = tabs.slice(-1)[0]; 

	//Update GUI
	updateTabs();
}

//Switch to a tab
var switchTab = function(args) {
    var target = -1;
    
    //Store the content of current editor to previous tab before switching
    for (i in tabs) {
    	if(tabs[i] == lastTab) {
    		var buff = editor.getValue();
    		sessions[i] = buff;
    	}
    }

    //Update target tab
    for (i in tabs) {
    	if(tabs[i] == args.innerHTML) {
    		target = i;
    		break;
    	}
    }

    //Update previous tab
    lastTab = tabs[target];

    if(target != -1) {
    	updateTabs(target);
    }
    
    //Reset editor
    editor.setValue(sessions[target]);
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