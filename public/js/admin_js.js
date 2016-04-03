$(function() {

    /** Functions **/
    //Methode permettant de saisir seulement des nombres
    $("#nbUsersMax,#nbQuestions,#timerQuestion").keypress(function(event) {
    	var keyCode = event.which ? event.which : event.keyCode;
     	//pour autoriser la suppression de caractère avec BACK ou SUPPR
    	if(keyCode != 8 && keyCode != 46) {
    		if(!String.fromCharCode(keyCode).match(/^\d+$/)){
    			return false;
    	   	}
    	}
    });
    
    
    /** Events **/
    $("#createRoom").click(function() {
        var nbUserSaisi = $("#nbUsersMax").val();
        var nbQuestionsSaisi = $("#nbQuestions").val();
        var timerQuestion = $("#timerQuestion").val();
        
        if (!$("#nbUsersMax").val().match(/^[0-9]{1,2}$/)) {
            $.notify("Veuillez indiquer le nombre de participants.");
        }else if(!$("#nbQuestions").val().match(/^[0-9]{1,2}$/)){
            $.notify("Veuillez indiquer le nombre de questions.");
        }else if(!$("#timerQuestion").val().match(/^[0-9]{1,2}$/)){
            $.notify("Veuillez indiquer le temps de réponse autorisé.");
        }else{
            var parametres = {'nbUsersMax': nbUserSaisi, 'nbQuestions' : nbQuestionsSaisi, 'timerQuestion' : timerQuestion};
            document.location="/paramRoom/" + JSON.stringify(parametres);
        }
    });
    
});