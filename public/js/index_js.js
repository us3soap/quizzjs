$(function() {
    
    /** Variable **/
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
            $.notify("Question n° " + cptQuestion);
            cptQuestion = cptQuestion+1;
        });
        
        setTimeout (function(){$.notify("Attention ! il reste 5 secondes.");}, 5000 );
        
        //arret de l'event au bout de 3 questions.
        //TODO nb question à paramètrer.
        if (cptQuestion==3) {
            clearInterval(eventQuestion);
        }
    }    
    
    /** Event **/
    socket.on('new-user-'+token, function(data) {
        $("#quota").html(data['nbUsers'] + "/" + nbUsersMax);
        $.notify("Bienvenue à " + data['user'], "info");
        $('#listeUser').append("<div id="+ data['usertoken'] +" class='col-md-12 user'><img src='/img/question.png' style='margin-right: 15px;' width='10%'/>"+ data['user']+"</div>").hide().show('slow');
        
        if(nbUsersMax == data['nbUsers']){
            $("#quota").addClass( "label-success" );
        }else{
            $("#quota").removeClass( "label-success" );
        }
    });
    
    socket.on('user-left-'+token, function(data) {
        $.notify(data['username'] + " s'est déconnecté.");
        $("#quota").html(data['nbUsers'] + "/" + nbUsersMax);
        $('#'+data['usertoken']).hide();
    });
    
    socket.on('start-party-room-'+token, function(user) {
        
        $.notify("La partie commence dans 5...");
        setTimeout (function(){$.notify("La partie commence dans 4...");}, 1000 );
        setTimeout (function(){$.notify("La partie commence dans 3...");}, 2000 );
        setTimeout (function(){$.notify("La partie commence dans 2...");}, 3000 );
        setTimeout (function(){$.notify("La partie commence dans 1...");}, 4000 );
        
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