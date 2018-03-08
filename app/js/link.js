function getCurrentFile() {
	let files = database.ref('files');
	files.on('value', function(data) {
		let file = data.val();
		// console.log(file);
	});
}

// var edits = ['George: Line #45', 'Arun: Line #154', 'Bryan: Line #221', 'Alex: Line #13', 'Paramesh: Line #191', 'Guangqi: Line #133'];

function loadEdits() {
	let editHTML = '';
	let fileEdits = database.ref('files/-L73SCQ_U4ak-ETzrCzC/edits');
	let userNames = database.ref('users');
	userNames.on('value', function(data){
		console.log(data.val());
	});
	fileEdits.on('value', function(data){
		for(edit in data.val()) {
			editVal = data.val()[edit];
			if(editVal.type == 'add') {
				editHTML += '<div id="edit-add" class="edit">' + editVal.content + '</div>\n';						
			} else {
				editHTML += '<div id="edit-remove" class="edit">' + editVal.content + '</div>\n';
			}
			// console.log('<div id="edit-add" class="edit">' + editVal.content + '</div>\n')
		}
		$('#edits').empty();
		$('#edits').append(editHTML);	
	});
}

loadEdits();