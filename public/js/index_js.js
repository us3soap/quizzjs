$(function() {
    
    /** Variable **/
    /* global io*/
    /* global log*/
    var cptQuestion = 0;
    var eventQuestion = null;
    var eventChrono = null;
    var url = $("#url").val();
    var token = $("#token").val();
    var nbUsersMax = $("#nbUsersMax").val();
    var nbQuestions = $("#nbQuestions").val();
    var tempsParQuestion = 10;
    
    var socket = io.connect('http://'+ url);

    /** Functions **/
    //cycle de vie de la question.            
    function myGame() {
        
        if (cptQuestion == nbQuestions) {
            clearInterval(eventQuestion);
            clearInterval(eventChrono);
            
            //Afficahge des scores.
            displayInterface("score");
            
        } else {
            socket.emit('recup-question', {room : token}, function (data) {
                clearInterval(eventChrono);
                cptQuestion = cptQuestion+1;
                $("#affichQuestion").html(data['question']);
                $("#reponse1").html(data['reponse1']);
                $("#reponse2").html(data['reponse2']);
                $("#reponse3").html(data['reponse3']);
                $("#reponse4").html(data['reponse4']);
                $("#tempsRestant").html(tempsParQuestion);
                displayInterface("play");
                notify("Question n° " + cptQuestion, 1, "info");
                
                eventChrono = setInterval(chrono, 1000 ); //timer mise a jour du chrono.
            });
            
            setTimeout (function(){$.notify("Attention ! il reste 5 secondes.");}, ((tempsParQuestion * 1000) - 5000) );
        }
    }    
    
    function chrono(){
        var tmp = parseFloat($("#tempsRestant").html());
        $("#tempsRestant").html(tmp-1);
    }
    /**
     * Fonction permettant de gerer les notifications sur l'écran.
     * 
     * @arg String msg : Le message à afficher
     * @arg int loop : le nombre d'occurence à afficher avec un délais d'une seconde.
     * @arg String status : le style à appliquer [success, info, warn, error]
     **/ 
    function notify(msg, loop, status){
        if(loop == 1){
            $.notify(msg, status);
        }else{
            var i;
            var decount = loop;
            
            for (i = 0; i < loop; i++) {
                var messageEntier = msg + decount;
                setTimeout (onTimeout(msg,decount,status), i * 1000 );
                decount--;
            }
        }
    }
    
    /**
     * fonction appelé par le decompte
     * passage par une autre fonction qui va créer une nouvelle fermeture
     * @arg String msg : Le message à afficher
     * @arg String decount : la fin du message
     * @arg String status : le style à appliquer [success, info, warn, error]
     **/
    function onTimeout(msg, decount, status) {
        return function(){
                    $.notify(msg + decount, status);
                };
    }
    
    /**
     * Function permettant l'ajout d'un joueur.
     * @arg String token : la clé référençant l'utilisateur.
     * @arg String username : le nom d'utilisateur.
     **/
    function addParticipants(token, username){
        notify("Bienvenue à " + username, 1, "info");
        $('#listeUser').append("<div id="
                                + token 
                                + " class='col-md-12 user' style=\"display: none\"><img src='/img/question.png' style='margin-right: 15px;' width='10%'/>"
                                + "<span class=\"username\">"
                                + username
                                + "</ span>"
                                + "<span id=\"badge-" + token + "\" style=\"display:none\" class=\"badge badge-display\">0</span>"
                                + "</div>"
                            );
        $("#"+token).show("slow");
    }
    
    /**
     * Function permettant la suppression d'un joueur.
     * @arg String token : la clé référençant l'utilisateur.
     * @arg String username : le nom d'utilisateur.
     **/
    function removeParticipant(token, username){
        notify(username + " s'est déconnecté.", 1, "error");
        $('#'+token).remove();
    }
    
    /**
     * Function permettant la gestion du quota de joueur.
     * @arg int nbUsersActuels : le nombre d'utilisateur connecté.
     **/
    function gererUsersMax(nbUsersActuels){
        $("#quota").html(nbUsersActuels + "/" + nbUsersMax);
        if(nbUsersMax == nbUsersActuels){
            $("#quota").addClass( "label-success" );
        }else{
            $("#quota").removeClass( "label-success" );
        }
    }
    
    /**
     * Function permettant de diffuser les scores à côté du nom de l'utilisateur.
     * @arg boolean bool : déterminant l'affichage ou non.
     **/
    function showScores(bool){
        if(bool){
            $(".badge-display").show();
        } else {
            $(".badge-display").hide();
        }
    }
    
    /**
     * Function permettant la gestion de la vue à afficher.
     * @arg String la vue à atteindre [wait -> transition -> play -> score]
     **/
    function displayInterface(view){
        if(view == "wait"){
            $("#qr-code").show("slow");
            $("#listeUser").show("slow");
            showScores(false);
        } else if(view == "transition") {
            $("#qr-code").hide("slow");
            showScores(true);
        } else if(view == "play") {
            $("#question").show("slow");
        } else if (view == "score"){
            //$("#listeUser").hide("slow");
            $("#question").hide("slow");
            $("#scoring").show("slow");
            showResultat();
        } else {
            log.error("La vue n'est pas connue");
        }
    }
    
    /**
     * Function gérant l'animation des scores.
     **/
    function showResultat(){
        $( ".user" ).each(function( index ) {
            $("#scoring").append(
                "<div class=\"progress\">"
                +   "<div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\""
                +       $(this).find('.badge-display').html() / nbQuestions * 100
                +       "\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "
                +       $(this).find('.badge-display').html() / nbQuestions * 100
                +       "%;\">"
                +       $(this).find('.username').html()
                +   "</div>"
                + "</div>"
                );
        });
        
    }
    
    /** Event **/
    socket.on('new-user-'+token, function(data) {
        
        addParticipants(data['usertoken'], data['user']);
        gererUsersMax(data['nbUsers']);
        
    });
    
    socket.on('user-left-'+token, function(data) {

        removeParticipant(data['usertoken'], data['username']);
        gererUsersMax(data['nbUsers']);

    });
    
    socket.on('start-party-room-'+token, function(user) {
        notify("La partie commence dans ", 5, "warn");
        
        
        setTimeout (function(){
           socket.emit('start', {room : token}, function (data) {
                displayInterface("transition");
                
                //Je lance ma fonction en même temps que l'event
                //car la première itération de mon event se fait au bon de 10 sec.
                myGame();
                //ici, une question durera 10 sec
                //TODO paramétrer la durée de réponse d'une question.
                eventQuestion = setInterval(myGame, (tempsParQuestion * 1000 ) );
            });
            //-- Une fois les questions finis, il faut juste que tu appelles displayInterface("score");

        }, 5000);
    });
    
    socket.on('maj-party-users-'+token, function(data) {
        $("#badge-"+ data['usertoken']).html(data["score"]);
    });
});