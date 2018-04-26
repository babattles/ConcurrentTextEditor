
var aSetBtn = document.getElementById('acceptSettings');
var percentCheck = document.getElementById('percent-check');
var percentVal = document.getElementById('pVal');
var quotaCheck = document.getElementById('quota-check');
var quotaVal = document.getElementById('qVal');
var offlineUsersAccept = document.getElementById('offline-accept');
var saveSettingsBtn = document.getElementById('saveSettingsBtn');
var cancelBtn = document.getElementById('cancelBtn');



ipcRenderer.on('quota-settings', function(event, arg) {
	var user = firebase.auth().currentUser;
	if(currentFile == undefined || currentFile == null){
		alert('A file must be open to change its settings!');
	} else if(user == undefined || user == null){
		alert('no one is signed in!');
	} else {
		userIsAdmin(currentFile, user.uid, function(isAdmin){
			if (isAdmin){
				openAcceptance();
			} else {
				alert('You can\'t do that, you are not an administrator');
			}
		});
	}
});

var openAcceptance = function(){
	//open window
	aSetBtn.classList.toggle("hidden");

	//load settings
	loadMode();
}

var loadMode = function(){
	currentFile.child('mode').child('useRule').once('value', function(snap){
		if (snap.exists()){
			//console.log(snap.val());
			if (snap.val() == 'p'){
				currentFile.child('mode').once('value', function(snap){
					var value = snap.val().pVal;
					//console.log(value);
					document.getElementById("percent-check").checked = true;
					document.getElementById("pVal").defaultValue = value;
				});
				return 'p';
			} else if (snap.val() == 'q') {
				currentFile.child('mode').once('value', function(snap){
					var value = snap.val().qVal;
					//console.log(value);
					document.getElementById("quota-check").checked = true;
					document.getElementById("qVal").defaultValue = value;
				});
				return 'q';
			} /*else if (snap.val() == 'o') {
				currentFile.child('offlineAccept').once('value', function(snap){
					if (snap.exists()){
						//console.log(snap.val());
						if (snap.val().count != null) document.getElementById('offline-accept').checked = true;
						else document.getElementById('offline-accept').checked = false;
					} else {
						//default values
						document.getElementById('offline-accept').checked = false;
						currentFile.child('offlineAccept').set({'count': null});
					}
				});
				return 'o';
			} */
		} else {
			//if the value does not exist then create it with default value
            currentFile.child('mode').set({'useRule': 'p', 'pVal': 100, 'qVal': ''});
            //currentFile.child('offlineAccept').set({'count': null});
			document.getElementById("percent-check").checked = true;
			document.getElementById("pVal").defaultValue = 100;
			return 'p';
		}
	});
}

cancelBtn.addEventListener("click", function () {
	aSetBtn.classList.toggle("hidden");
});

saveSettingsBtn.addEventListener("click", function () {
	if (percentCheck.checked) {
		//currentFile.child('offlineAccept').set({'count': null});
		percentActivated();
	} else if (quotaCheck.checked) {
		//currentFile.child('offlineAccept').set({'count': null});
		quotaActivated();
	} /*else if (offlineUsersAccept){
		var p = percentVal.value;
		var q = quotaVal.value;
		currentFile.child('offlineAccept').set({'count': 0});
		currentFile.child('mode').set({'useRule': 'o', 'pVal': p, 'qVal': q});

		//close Window
		aSetBtn.classList.toggle("hidden");
		updateEditAcceptance();
	}*/
});

var percentActivated = function(){
	var p = percentVal.value;
	var q = quotaVal.value;
	console.log(p);

	if (p == null || p == undefined) {
		alert('You didnt enter a percent, default value of 100% is used');
		p = 100;
	}

	if (p <= 0 && p > 100) {
		alert('percent cannot be less than 0 or more than 100');
		return true;
	}
    var numUsers;
    currentFile.child('userList').once("value", function(snapshot) {
            numUsers = snapshot.numChildren();
    });
    var ratio = Math.ceil(numUsers*(p/100));
    if (ratio < 1) {
    	alert('The lowest percentage possible with this many users is '+Math.round((1/numUsers)*100));
    	return true;
    }

	//set mode and value on server
	currentFile.child('mode').set({'useRule': 'p', 'pVal': p, 'qVal': ''});

	//close Window
	aSetBtn.classList.toggle("hidden");

	//update edits accordingly
	console.log('from percentActivated()');
	updateEditAcceptance();
}


var quotaActivated = function(){
	var p = percentVal.value;
	var q = quotaVal.value;

	if (q == null || q == undefined) {
		alert('You must enter a value into the selected field');
		return true;
	}

	if (q < 1) {
		alert('quota cannot be less than 1');
		return true;
	}
	//round to nearest whole number
	q = Math.round(q);
	//set mode and value on server
	currentFile.child('mode').set({'useRule': 'q', 'pVal': p, 'qVal': q});

	//close Window
	aSetBtn.classList.toggle("hidden");

	//update edits accordingly
	console.log('from qoutaActivated()');
	updateEditAcceptance();

}


var checkAcceptanceCriteria = function(editID){
	var numUsers;
	
	//get the number of users
	firebase.database().ref().child("files").child(currentKey)
	    		.child('userList').once("value", function(snapshot) {
	    numUsers = snapshot.numChildren();
	    console.log(numUsers);
	    currentFile.child('edits').child(editID).child('accepted').once("value", function(snapshot) {
    		var numAccepted = snapshot.numChildren();
    		currentFile.child('mode').child('useRule').once('value', function(snap){
    			//set numNeeded according to the setting
			    var numNeeded;
			    var mode;

    			if (!snap.exists()){
    				currentFile.child('mode').set({'useRule': 'p', 'pVal': 100, 'qVal': ''});
    				mode = 'p';

    			} else {
    				mode = snap.val();
    			}
    			
			    if (mode == 'p'){
					currentFile.child('mode').once('value', function(snap){
						numNeeded = Math.ceil((snap.val().pVal/100)*numUsers);
						if (numAccepted >= numNeeded) acceptEdit(editID);
					});
				} else if (mode == 'q'){
					currentFile.child('mode').once('value', function(snap){
						numNeeded = snap.val().qVal;
						console.log('Quota', numAccepted,' / ', numNeeded);
						if (numAccepted >= numNeeded) acceptEdit(editID);
					});
				}
				/*else if (mode == 'o'){
					currentFile.child('mode').once('value', function(snap){
						numNeeded = numUsers;
						//check for a offline users count
				        currentFile.child('offlineAccept').once('value', function(snap){
			        		var numOffline = snap.val().count;
							if ( numOffline != null && numOffline < numUsers) {
								if (numAccepted >= numNeeded) acceptEdit(editID);
							}	
						});
					});
				}*/
			});
		});
	});
}

var updateEditAcceptance = function(){
	//check for any edit that now has met the quota
	for (var i = 0; i < edits.length; i++) {
		checkAcceptanceCriteria(edits[i].id);
	}
}






