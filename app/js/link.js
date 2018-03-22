const { clipboard } = require('electron');
function copyLink() {
	if(currentKey == undefined) {
		console.log('No File Selected');
		return;
	}
	let fileEdits = database.ref('files/' + currentKey);
	fileEdits.on('value', function(data){
		console.log(data.val().link);
		clipboard.writeText(data.val().link);
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
				let eContent;
				if(editVal.content.length > 20) {
					eContent = editVal.content.substring(0, 20);
				}
				else {
					eContent = editVal.content;
				}
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