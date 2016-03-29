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
    
    /** Event **/
    socket.on('new-user-'+token, function(data) {
        $("#quota").html(data['nbUsers'] + "/" + nbUsersMax);
        notify("Bienvenue à " + data['user'], 1, "info");
        $('#listeUser').append("<div id="+ data['usertoken'] +" class='col-md-12 user'><img src='/img/question.png' style='margin-right: 15px;' width='10%'/>"+ data['user']+"</div>").hide().show('slow');
        
        if(nbUsersMax == data['nbUsers']){
            $("#quota").addClass( "label-success" );
        }else{
            $("#quota").removeClass( "label-success" );
        }
    });
    
    socket.on('user-left-'+token, function(data) {
        notify(data['username'] + " s'est déconnecté.", 1, "error");
        $("#quota").html(data['nbUsers'] + "/" + nbUsersMax);
        $('#'+data['usertoken']).hide();
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