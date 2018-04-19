//Tab Functionality
var tabs = [];

//Variable that keep tracking previous tab
var lastTab;

//Variable that keep tracking current tab
var currTab;

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
    if (tabs[0] != "untitled") {
	   tabs.push(filename);
	
	   //Update content of the tab
	   //sessions.push(editor.getValue());

	   //Update lastTab
	   lastTab = tabs.slice(-1)[0]; 

	   updateTabs();
    }
    else {
        tabs[0] = filename;
        // console.log(sessions);
        sessions.push(editor.getValue());
        //sessions[0] = editor.getValue;
        fileNum--;

        updateTabs();
    }
}

//Close current tab
var closeTab = function() {
	var index = 0;
	index = tabs.indexOf(currTab);
	
	if (index > -1) {
    	tabs.splice(index, 1);
    	sessions.splice(index, 1);
	}
	global_ignore = true;
	editor.setValue('', -1);
	global_ignore = false;

	console.log(index);
	//editor.reset();
	if (index < 0) {
		index = 1;
	}
	console.log(index);
    global_ignore = true;
	editor.setValue(sessions[index - 1]);
    global_ignore = false;
	updateTabs(index - 1);
}

//Switch to a tab
var switchTab = function(args) {
	global_ignore = true;
    var target = -1;
    
    //Store the content of current editor to previous tab before switching
    for (i in tabs) {
    	if(tabs[i] == lastTab) {
    		var buff = editor.getValue();
            //console.log(fileKey[i]);
            //console.log(buff);
            //firebase.database().ref().child("users")
            //.child(global_user.uid).child("fileList").child(fileKey[i]).update({ 'content': buff });
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

    currTab = lastTab;
   	//console.log(currTab);
   	

    if(target != -1) {
    	updateTabs(target);
    }

    //Reset editor
    editor.setValue(sessions[target]);
    editor.clearSelection();

    console.log(fileKey[target]);
    //console.log(fileKey);
    var file = database.ref("files").child(fileKey[target]);
    //console.log(file)
    //console.log(file);
    currentFile = file;
 
    editRef = currentFile.child("edits");
    currentKey = fileKey[target];
    //clearEdits();
    getEdits();
    loadEdits();


    global_ignore = false;
}

var updateTabs = function (activeTab) {
	if(typeof activeTab == 'undefined') {
		activeTab = tabs.length - 1;
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