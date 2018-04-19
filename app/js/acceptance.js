
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
			//default value
            currentFile.child('mode').set({'percent': true,'quota': false, 'pVal': 100, 'qVal': ''});
			document.getElementById("percent-check").checked = true;
			document.getElementById("pVal").defaultValue = 100;
			//offAcc
			currentFile.child('offlineAccept').once('value', function(snap){
				if (snap.exists()){
					//console.log(snap.val());
					if (snap.val() == true) document.getElementById('offline-accept').checked = true;
					else document.getElementById('offline-accept').checked = false;
				} else {
					document.getElementById('offline-accept').checked = false;
					currentFile.child('offlineAccept').set({'bool': false});
				}
			});
			//return false;
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
				console.log(value);
				document.getElementById("percent-check").checked = true;
				document.getElementById("pVal").defaultValue = value;
			});
		} else if (mode == 'q'){
			currentFile.child('mode').once('value', function(snap){
				var value = snap.val().qVal;
				console.log(value);
				document.getElementById("quota-check").checked = true;
				document.getElementById("qVal").defaultValue = value;
			});
		}
	
		currentFile.child('offlineAccept').once('value', function(snap){
			if (snap.exists()){
				//console.log(snap.val().bool);
				if (snap.val().bool == true) document.getElementById('offline-accept').checked = true;
				else document.getElementById('offline-accept').checked = false;
			} else {
				document.getElementById('offline-accept').checked = false;
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
	checkNumRequired();
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
    var ratio = numUsers*(p/100);
    if (ratio < 1) {
    	alert('The lowest percentage possible with this many users is '+(1/numUsers)*100);
    	return true;
    }

	//set mode and value on server
	currentFile.child('mode').set({'percent': true,'quota': false, 'pVal': p, 'qVal': ''});

	//close Window
	aSetBtn.classList.toggle("hidden");
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

}

var offlineAccept = function(){
	var offAcc = offlineUsersAccept.checked;
	if (offAcc) {
		currentFile.child('offlineAccept').set({'bool': true});
	} else {
		currentFile.child('offlineAccept').set({'bool': false});
	}
}
var checkNumRequired = function(editVal){
	editVal = editVal || null;
	var numRequired;
	currentFile.child('mode').once('value', function(snapshot){
		var p = snapshot.val().pVal;
		var q = snapshot.val().qVal;
		var isPercent = snapshot.val().percent;
		if (isPercent){
			var numUsers;
		    currentFile.child('userList').once("value", function(snapshot) {
		            numUsers = snapshot.numChildren();
		    });
		    numRequired = Math.ceil(numUsers*p/100);
		    if(editVal){
		    	 checkAccByID(editVal, function(numAccepted, edit){
					//console.log(edit);
					//console.log(numRequired, numAccepted)
					if (numAccepted >= numRequired) acceptEdit(editVal);
					return numRequired;
				});

		    } else {
			    checkNumAccepted(function(numAccepted, edit){
					//console.log(edit);
					//console.log(numRequired, numAccepted)
					if (numAccepted >= numRequired) acceptEdit(edit);
					return numRequired;
				});
		    }
			

		} else {
			numRequired = q;
			 if(editVal){
		    	 checkAccByID(editVal, function(numAccepted, edit){
					//console.log(edit);
					//console.log(numRequired, numAccepted)
					if (numAccepted >= numRequired) acceptEdit(editVal);
					return numRequired;
				});

		    } else {
			    checkNumAccepted(function(numAccepted, edit){
					//console.log(edit);
					//console.log(numRequired, numAccepted)
					if (numAccepted >= numRequired) acceptEdit(edit);
					return numRequired;
				});
		    }
		}
	});
}

var checkAccByID = function(editVal, _callback){
	var numAccepted = 0;
	currentFile.child('offlineAccept').once('value', function(snap){
		//count through count all accepted only increment if offline and not in accepted
		currentFile.child('edits').child(editVal.id).child('accepted').once("value", function(snapshot) {
	        numAccepted = snapshot.numChildren();
	        console.log(numAccepted);
	        //if offline and has not accepted edit
			if (snap.val().bool == true){
		        snapshot.forEach(function(inAccepted) {
		        	currentFile.child('userList').once('value', function(isOffline){
		        		if (!inAccepted.hasChild(isOffline.key)
		        			&& isOffline.val().online == false){
		        				numAccepted++;
		        		}
		        	});
		        });
		    }
		});
	_callback(numAccepted);
	});	
}

var checkNumAccepted = function(_callback){
	var numAccepted = 0;
	currentFile.child('offlineAccept').once('value', function(snap){
		//count through count all accepted only increment if offline and not in accepted
		for (var i = 0; i < edits.length; i++) {
			currentFile.child('edits').child(edits[i].id).child('accepted').once("value", function(snapshot) {
		        numAccepted = snapshot.numChildren();
		        console.log(numAccepted);
		        //if offline and has not accepted edit
				if (snap.val().bool == true){
			        snapshot.forEach(function(inAccepted) {
			        	currentFile.child('userList').once('value', function(isOffline){
			        		if (!inAccepted.hasChild(isOffline.key)
			        			&& isOffline.val().online == false){
			        				numAccepted++;
			        		}
			        	});
			        });
			    }
			});
		_callback(numAccepted, edits[i].id);
		}
	});	
}



