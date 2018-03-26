const { clipboard } = require('electron');
function copyLink() {
	if(currentKey == undefined) {
		console.log('No File Selected');
		return;
	}
	let fileEdits = database.ref('files/' + currentKey);
	fileEdits.on('value', function(data){
		if(data.val().link) {
			clipboard.writeText(data.val().link);
		}
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
	var parentList = [];
	var childList = [];
	userNames.on('value', function(userData){
		fileEdits.on('value', function(data){
			for(i in data.val()) {
				if(!data.val()[i].parent) {
					parentList.push({
					 	'id': i,
					 	'username': userData.val()[data.val()[i].user].username,
					 	'content': data.val()[i].content,
					 	'type': data.val()[i].type
					});

				} else {
					childList.push({
					 	'id': i,
					 	'username': userData.val()[data.val()[i].user].username,
					 	'content': data.val()[i].content,
					 	'type': data.val()[i].type,
					 	'parent': data.val()[i].parent
					});
				}
			}
			for(i in childList) {
				for (j in parentList) {
					if(parentList[j].id == childList[i].parent) {
						parentList[j].child = childList[i];
						break;
					}
				}
			}
			for(var i = 0; i < parentList.length; i++) {
				editVal = parentList[i];
				let eContent;
				if(editVal.content.length > 20) {
					eContent = editVal.content.substring(0, 20);
				}
				else {
					eContent = editVal.content;
				}
				let divContent = '<b>' + editVal.username + '</b>: ' + eContent;
				if(editVal.type == 'insert') {
					editHTML += '<div id="edit-add" class="edit">' + divContent + '</div>\n';						
				} else {
					editHTML += '<div id="edit-remove" class="edit">' + divContent + '</div>\n';
				}
				if(editVal.child) {
					childVal = editVal.child;
					let childContent;
					if(childVal.content.length > 20) {
						childContent = childVal.content.substring(0, 20);
					}
					else {
						childContent = childVal.content;
					}
					let childDiv = '<b>' + childVal.username + '</b>: ' + childContent;
					if(childVal.type == 'insert') {
						editHTML += '<div id="edit-add-child" class="edit">' + childDiv + '</div>\n';						
					} else {
						editHTML += '<div id="edit-remove-child" class="edit">' + childDiv + '</div>\n';
					}
				}
			}
			$('#edits').empty();
			$('#edits').append(editHTML);
			editHTML = '';	
		});
	});
}