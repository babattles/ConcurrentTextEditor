function getCurrentFile() {
	let files = database.ref('files');
	files.on('value', function(data) {
		let file = data.val();
		// console.log(file);
	});
}

function loadEdits() {
	$('#edits').empty();
	let editHTML = '';
	let fileEdits = database.ref('files/-L73SCQ_U4ak-ETzrCzC/edits');
	let userNames = database.ref('users');
	userNames.on('value', function(userData){
		fileEdits.on('value', function(data){
		for(edit in data.val()) {
			editVal = data.val()[edit];
			let eU = userData.val()[editVal.user].username;
			let divContent = eU + ': ' + editVal.startIndex + ' - ' + editVal.endIndex;
			if(editVal.type == 'add') {
				editHTML += '<div id="edit-add" class="edit">' + divContent + '</div>\n';						
			} else {
				editHTML += '<div id="edit-remove" class="edit">' + divContent + '</div>\n';
			}
		}
		$('#edits').empty();
		$('#edits').append(editHTML);	
	});


	});
	
}

loadEdits();