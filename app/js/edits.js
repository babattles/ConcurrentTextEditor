//Makes edit disappear when you approve it
$(document).ready(function(){
    $(".edit").click(function(){
    	// console.log(this.innerHTML);
    	var confirmation = confirm("Are you sure you want to accept this edit?\n\n" + this.innerHTML);
    	if (confirmation === true ) {
    		this.style.display = 'none';
    	} 
    });
});

