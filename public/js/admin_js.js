$(function() {

    var cptQuestion = 0;
    
    /** Events **/
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
    
    
    $("#createRoom").click(function() {
        var nbUserSaisi = $("#nbUsersMax").val();
        var nbQuestionsSaisi = $("#nbQuestions").val();
        var timerQuestion = $("#timerQuestion").val();
        
        var messageErreur = controleDeSurface();
        
        if (messageErreur != "") {
            $.notify(messageErreur);
        }else{
            var parametres = {'nbUsersMax': nbUserSaisi, 'nbQuestions' : nbQuestionsSaisi, 'timerQuestion' : timerQuestion};
            document.location="/paramRoom/" + JSON.stringify(parametres);
        }
    });
    
    
    $("#createQuestion").click(function() {
        $("#ajoutQuestion").append(recupDivAjoutQuestion());
    });
    
    
    $("#deleteQuestion").click(function() {
        $("#divQuestion" + cptQuestion).remove();
        cptQuestion--;
        if (cptQuestion == 0) {
            $("#deleteQuestion").hide();
        }
    });
    
    
    /** Fonctions **/
    function recupDivAjoutQuestion() {
        cptQuestion++;
        if (cptQuestion > 0 ) {
            $("#deleteQuestion").show();
        }
        return "<div id=\"divQuestion" + cptQuestion + "\">"
                            + "</br>"
                            + "<textarea id=\"question_" + cptQuestion +"\" placeholder=\"Question\" style=\"width: 456px; height: 66px;text-align: center;\"></textarea></br></br>"
                            + "<input id=\"reponse1_" + cptQuestion +"\" type=\"text\" placeholder=\"Reponse1\" style=\"text-align: center;\" />"
                            + "<input id=\"reponse2_" + cptQuestion +"\" type=\"text\" placeholder=\"Reponse2\" style=\"text-align: center;\" /> </br></br>"
                            + "<input id=\"reponse3_" + cptQuestion +"\" type=\"text\" placeholder=\"Reponse3\" style=\"text-align: center;\" />"
                            + "<input id=\"reponse4_" + cptQuestion +"\" type=\"text\" placeholder=\"Reponse4\" style=\"text-align: center;\" /> </br></br>"
                            + "<textarea id=\"explication_" + cptQuestion +"\" placeholder=\"Explication\" style=\"width: 456px; height: 44px;text-align: center;\"></textarea></br></br>"
                            + "</div>";
    }
    
    function controleDeSurface() {
        var erreur = "";
        
        if (!$("#nbUsersMax").val().match(/^[0-9]{1,2}$/)) {
            erreur += "Veuillez indiquer le nombre de participants.\n";
        }
        if(!$("#nbQuestions").val().match(/^[0-9]{1,2}$/)){
            erreur += "Veuillez indiquer le nombre de questions.\n";
        }
        if(!$("#timerQuestion").val().match(/^[0-9]{1,2}$/)){
            erreur += "Veuillez indiquer le temps de réponse autorisé.\n";
        }
        
        //verif de la saisie des questions ajoutées
        for (var i = 1 ; i <= cptQuestion ; i++) {
            if ($("#question_" + i).val() == "") {
                erreur += "Veuillez indiquer la question " + i + "\n";
            }
            if ($("#reponse1_" + i).val() == "") {
                erreur += "Veuillez indiquer la reponse 1 de la question " + i + "\n";
            }
            if ($("#reponse2_" + i).val() == "") {
                erreur += "Veuillez indiquer la reponse 2 de la question " + i + "\n";
            }
            if ($("#reponse3_" + i).val() == "") {
                erreur += "Veuillez indiquer la reponse 3 de la question " + i + "\n";
            }
            if ($("#reponse4_" + i).val() == "") {
                erreur += "Veuillez indiquer la reponse 4 de la question " + i + "\n";
            }
            if ($("#explication_" + i).val() == "") {
                erreur += "Veuillez indiquer l'explication de la question " + i + "\n";
            }
        }
        
        return erreur;
    }
});