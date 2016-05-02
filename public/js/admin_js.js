$(function() {

    var cptQuestion = 0;
    var socket = io.connect(GLOBAL.url);
    
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
            var fluxnouvellesQuestions = recupFluxNouvellesQuestions();
            var parametres = {'room': GLOBAL.token, 'nbUsersMax': nbUserSaisi, 'nbQuestions' : nbQuestionsSaisi, 'timerQuestion' : timerQuestion, 'nbNouvellesQuestions' : cptQuestion.toString(), 'nouvellesQuestions' : fluxnouvellesQuestions};
            socket.emit('param-room', parametres , function (data) {
                if (data["url"] != null){
                    document.location=data["url"];
                }
            });
            
            //document.location="/paramRoom/" + JSON.stringify(parametres);
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
                        + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse1_" + cptQuestion + "\" value=\"reponse1\" />"
                    + "<input id=\"reponse2_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 2\" style=\"text-align: center;\" />"
                        + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse2_" + cptQuestion + "\" value=\"reponse2\" ></br></br>"
                    + "<input id=\"reponse3_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 3\" style=\"text-align: center;\" />"
                        + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse3_" + cptQuestion + "\" value=\"reponse3\" >"
                    + "<input id=\"reponse4_" + cptQuestion +"\" type=\"text\" placeholder=\"Réponse 4\" style=\"text-align: center;\" />"
                        + "<input name=\"reponseQuestion_" + cptQuestion + "\" type=\"radio\" id=\"bonne_reponse_reponse4_" + cptQuestion + "\" value=\"reponse4\" ></br></br>"
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
            if ($("input[name=reponseQuestion_" + i + "]:checked").length == 0) {
                erreur += "Veuillez indiquer la bonne réponse à la question " + i + "\n";
            }
        }
        
        return erreur;
    }
    
    
    //retourne le flux (String) a envoyer au server.js
    function recupFluxNouvellesQuestions() {
        var flux = '{' +
                        '"name" :  "Fichier de questions",' +
                        '"version" : 0.1,' +
                        '"token": "123456",' +
                        '"questions" : [';
        
        for (var i = 1 ; i <= cptQuestion ; i++) {
            if (i > 1) {
                flux += ',';
            }
            flux += '{"id":' + (i-1);
            flux += ',"question":"' + $("#question_" + i).val() + '"';
            flux += ',"type": "question"';
            flux += ',"reponse1":"' + $("#reponse1_" + i).val() + '"';
            flux += ',"reponse2":"' + $("#reponse2_" + i).val() + '"';
            flux += ',"reponse3":"' + $("#reponse3_" + i).val() + '"';
            flux += ',"reponse4":"' + $("#reponse4_" + i).val() + '"';
            flux += ',"good":"' + $("input[name=reponseQuestion_" + i + "]:checked").val() + '"';
            flux += ',"explication":"' + $("#explication_" + i).val() + '"}';
        }
        
        flux += "]}";
        return flux ;
    }
});