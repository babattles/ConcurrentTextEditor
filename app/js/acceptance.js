
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

var loadMode = function(_callback){
	var mode;

	currentFile.child('mode').child('percent').once('value', function(snap){
		if (snap.exists()){
			//console.log(snap.val());
			if (snap.val() == true){
				mode = 'p';
				_callback(mode);
			} 
			else{
				 mode = 'q';
				_callback(mode);
			}
		} else {
			//if the value does not exist then create it with default value
            currentFile.child('mode').set({'percent': true,'quota': false, 'pVal': 100, 'qVal': ''});
			document.getElementById("percent-check").checked = true;
			document.getElementById("pVal").defaultValue = 100;
		}
	});
	//offline Accept
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
}

var openAcceptance = function(){
	//open window
	aSetBtn.classList.toggle("hidden");

	//load settings
	loadMode(function(mode){

		if (mode == 'p'){
			currentFile.child('mode').once('value', function(snap){
				var value = snap.val().pVal;
				//console.log(value);
				document.getElementById("percent-check").checked = true;
				document.getElementById("pVal").defaultValue = value;
			});
		} else if (mode == 'q'){
			currentFile.child('mode').once('value', function(snap){
				var value = snap.val().qVal;
				//console.log(value);
				document.getElementById("quota-check").checked = true;
				document.getElementById("qVal").defaultValue = value;
			});
		}
	
		currentFile.child('offlineAccept').once('value', function(snap){
			if (snap.exists()){
				//console.log(snap.val().bool);
				if (snap.val().count != null) document.getElementById('offline-accept').checked = true;
				else document.getElementById('offline-accept').checked = false;
			} else {
				document.getElementById('offline-accept').checked = false;
				currentFile.child('offlineAccept').set({'count': null});
			}
		});
	});
	
}

cancelBtn.addEventListener("click", function () {
	aSetBtn.classList.toggle("hidden");
});

saveSettingsBtn.addEventListener("click", function () {
	offlineAccept();

	if (percentCheck.checked) {
		percentActivated();
	} else if (quotaCheck.checked) {
		quotaActivated();
	}
});

var percentActivated = function(){
	var p = percentVal.value;
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
	currentFile.child('mode').set({'percent': true,'quota': false, 'pVal': p, 'qVal': ''});

	//close Window
	aSetBtn.classList.toggle("hidden");

	//update edits accordingly
	console.log('from percentActivated()');
	updateEditAcceptance();
}


var quotaActivated = function(){
	var q = quotaVal.value;
	//console.log(q);
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
	currentFile.child('mode').set({'percent': false,'quota': true, 'pVal': '', 'qVal': q});

	//close Window
	aSetBtn.classList.toggle("hidden");

	//update edits accordingly
	console.log('from qoutaActivated()');
	updateEditAcceptance();

}

var offlineAccept = function(){
	var offAcc = offlineUsersAccept.checked;
	if (offAcc) {
		currentFile.child('offlineAccept').set({'count': 0});
	} else {
		currentFile.child('offlineAccept').set({'count': null});
	}
}
var checkAcceptanceCriteria = function(editID){
	loadMode(function(mode){
		var numUsers;
		
		//get the number of users
		firebase.database().ref().child("files").child(currentKey)
		    		.child('userList').once("value", function(snapshot) {
		    numUsers = snapshot.numChildren();

		    //set numNeeded according to the setting
		    var numNeeded;
		    if (mode == 'p'){
				currentFile.child('mode').once('value', function(snap){
					numNeeded = Math.ceil((snap.val().pVal/100)*numUsers);
					getNumAccept(numNeeded, editID);
				});
			} else if (mode == 'q'){
				currentFile.child('mode').once('value', function(snap){
					numNeeded = snap.val().qVal;
					getNumAccept(numNeeded, editID);
				});
			}
		});
	});
}
//for the sake of readability
//this method is where acceptEdit is called
var getNumAccept = function(numNeeded, editID){
	console.log(numNeeded);
	//count number of user who have accepted the edit
	currentFile.child('edits').child(editID).child('accepted').once("value", function(snapshot) {
        var numAccepted = snapshot.numChildren();
        //check for a offline users count, if so, add # to to numAccepted
        currentFile.child('offlineAccept').once('value', function(snap){
        	if (snap.exists()){
        		console.log('offlineAccept exists');
        		//does not accept 
				if (snap.val().count != null && snap.val().count > 0) {
					numAccepted += snap.val().count;
					if (numAccepted >= numNeeded) acceptEdit(editID);
				} else {
					if (numAccepted >= numNeeded) acceptEdit(editID);
				}	
			} else {
				console.log('offlineAccept does not exist');
				currentFile.child('offlineAccept').set({'count': null});
				if (numAccepted >= numNeeded) acceptEdit(editID);
			}
			
		});
	});
}

var updateEditAcceptance = function(){
	//check for any edit that now has met the quota
	for (var i = 0; i < edits.length; i++) {
		checkAcceptanceCriteria(edits[i].id);
	}
}






