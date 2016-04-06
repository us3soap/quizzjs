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
    
    
    //Bouton Créer salon
    $("#createRoom").click(function() {
        var nbUserSaisi = $("#nbUsersMax").val();
        var nbQuestionsSaisi = $("#nbQuestions").val();
        var timerQuestion = $("#timerQuestion").val();
        
        //controle de surface, return "" si pas d'erreur.
        var messageErreur = controleDeSurface();
        
        if (messageErreur != "") {
            $.notify(messageErreur);
        }else{
            var parametres = {'nbUsersMax': nbUserSaisi, 'nbQuestions' : nbQuestionsSaisi, 'timerQuestion' : timerQuestion};
            document.location="/paramRoom/" + JSON.stringify(parametres);
        }
    });
    
    
    //bouton Ajouter une question
    $("#createQuestion").click(function() {
        $("#ajoutQuestion").append(recupDivAjoutQuestion());
    });
    
    
    //bouton Supprimer dernière question.
    $("#deleteQuestion").click(function() {
        $("#divQuestion" + cptQuestion).remove();
        cptQuestion--;
        if (cptQuestion == 0) {
            $("#deleteQuestion").hide();
        }
    });
    
    
    /** Fonctions **/
    //Recupère l'html à injecter pour ajouter une question.
    function recupDivAjoutQuestion() {
        cptQuestion++;
        if (cptQuestion > 0 ) {
            $("#deleteQuestion").show();
        }
        return "<div id=\"divQuestion" + cptQuestion + "\"></br>"
                    + "<textarea id=\"question_" + cptQuestion +"\" placeholder=\"Question\" style=\"width: 456px; height: 66px;text-align: center;\"></textarea></br></br>"
                    + "<input id=\"reponse1_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 1\" style=\"text-align: center;\" />"
                        + "<input type=\"checkbox\" id=\"bonne_reponse_reponse1_" + cptQuestion + "\" />"
                    + "<input id=\"reponse2_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 2\" style=\"text-align: center;\" />"
                        + "<input type=\"checkbox\" id=\"bonne_reponse_reponse2_" + cptQuestion + "\"></br></br>"
                    + "<input id=\"reponse3_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 3\" style=\"text-align: center;\" />"
                        + "<input type=\"checkbox\" id=\"bonne_reponse_reponse3_" + cptQuestion + "\">"
                    + "<input id=\"reponse4_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 4\" style=\"text-align: center;\" />"
                        + "<input type=\"checkbox\" id=\"bonne_reponse_reponse4_" + cptQuestion + "\"></br></br>"
                    + "<textarea id=\"explication_" + cptQuestion +"\" placeholder=\"Explication\" style=\"width: 456px; height: 44px;text-align: center;\"></textarea></br></br>"
                + "</div>";
    }
    
    //Récupère l'ensemble des messages d'erreurs.
    function controleDeSurface() {
        var erreur = "";
        
        //verif des 3 champs number
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
                erreur += "Veuillez indiquer la reponse 1 à la question " + i + "\n";
            }
            if ($("#reponse2_" + i).val() == "") {
                erreur += "Veuillez indiquer la reponse 2 à la question " + i + "\n";
            }
            if ($("#reponse3_" + i).val() == "") {
                erreur += "Veuillez indiquer la reponse 3 à la question " + i + "\n";
            }
            if ($("#reponse4_" + i).val() == "") {
                erreur += "Veuillez indiquer la reponse 4 à la question " + i + "\n";
            }
            if ($("#explication_" + i).val() == "") {
                erreur += "Veuillez indiquer l'explication de la question " + i + "\n";
            }
        }
        
        return erreur;
    }
    
    $('input:checkbox[id^="bonne_reponse_"]').click(function() {
       alert("toto");
    });
});