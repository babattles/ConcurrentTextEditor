//Makes edit disappear when you approve it
$(document).ready(function(){
	console.log('testing 1');
    $(".edit").click(function(){
    	this.style.display = 'none';
    });
});

