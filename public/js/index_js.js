$(function() {
    
    /** Variable **/
    /* global io*/
    var cptQuestion = 1;
    var eventQuestion = null;
    var url = $("#url").val();
    var token = $("#token").val();
    var nbUsersMax = $("#nbUsersMax").val();
            
    var socket = io.connect('http://'+ url);

    /** Functions **/
    //cycle de vie de la question.            
    function myGame() {

        socket.emit('recup-question', {room : token}, function (data) {

            $("#affichQuestion").html(data['question']);
            $("#reponse1").html(data['reponse1']);
            $("#reponse2").html(data['reponse2']);
            $("#reponse3").html(data['reponse3']);
            $("#reponse4").html(data['reponse4']);
            $("#question").show("slow");
            notify("Question n° " + cptQuestion, 1, "info");
            cptQuestion = cptQuestion+1;
        });
        
        setTimeout (function(){$.notify("Attention ! il reste 5 secondes.");}, 5000 );
        
        //arret de l'event au bout de 3 questions.
        //TODO nb question à paramètrer.
        if (cptQuestion==3) {
            clearInterval(eventQuestion);
        }
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
            for (i = 0; i < loop; i++) { 
                var decount = loop - i;
                setTimeout (function(){$.notify(msg + decount, status);}, i * 1000 );
            }
        }
    }
    
    /**
     * Function permettant l'ajout d'un joueur.
     * @arg String token : la clé référençant l'utilisateur.
     * @arg String username : le nom d'utilisateur.
     **/
    function addParticipants(token, username){
        notify("Bienvenue à " + username, 1, "info");
        $('#listeUser').append("<div id="+token +" class='col-md-12 user'><img src='/img/question.png' style='margin-right: 15px;' width='10%'/>"+ username +"</div>").hide().show('slow');
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
                $("#qr-code").hide("slow");
                //Je lance ma fonction en même temps que l'event
                //car la première itération de mon event se fait au bon de 10 sec.
                myGame();
                //ici, une question durera 10 sec
                //TODO paramétrer la durée de réponse d'une question.
                eventQuestion = setInterval(myGame, 10000);
            });
        }, 5000);
    });
    
});