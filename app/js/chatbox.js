//Minimizes chatbox if you click on it
$(document).ready(function(){
    $("#chatLabel").click(function(){
    	$("#chat").toggle();
    	$("#chatInput").toggle();
    });
});