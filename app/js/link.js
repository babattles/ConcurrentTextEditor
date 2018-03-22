function getCurrentFile() {
	let files = database.ref('files');
	files.on('value', function(data) {
		let file = data.val();
		// console.log(file);
	});
}

function loadEdits() {
	if(currentKey == undefined) {
		console.log('No File Selected');
		return;
	} 
	$('#edits').empty();
	let editHTML = '';
	let fileEdits = database.ref('files/' + currentKey + '/edits');
	let userNames = database.ref('users');
	userNames.on('value', function(userData){
		fileEdits.on('value', function(data){
			for(edit in data.val()) {
				editVal = data.val()[edit];
				let eU = userData.val()[editVal.user].username;
				// let divContent = eU + ': ' + editVal.startIndex + ' - ' + editVal.endIndex;
				let eContent;
				if(editVal.content.length > 20) {
					eContent = editVal.content.substring(0, 20);
				}
				else {
					eContent = editVal.content;
				}
				console.log(eContent);
				let divContent = eU + ':' + eContent;
				if(editVal.type == 'insert') {
					editHTML += '<div id="edit-add" class="edit">' + divContent + '</div>\n';						
				} else {
					editHTML += '<div id="edit-remove" class="edit">' + divContent + '</div>\n';
				}
			}
			$('#edits').empty();
			$('#edits').append(editHTML);
			editHTML = '';	
		});
	});
}