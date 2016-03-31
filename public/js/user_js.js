$(function() {
    
    /** Variable **/
    var url = $("#url").val();
    var socket = io.connect('http://'+ url);
    var token = $("#token").val();
    var pseudo = "";
    var userToken = "";
    
    /** Fonction **/
    $("#reponse1,#reponse2,#reponse3,#reponse4").click(function() {
        $('#command-tool').hide();
        $('#reponseSaisie').html($("#"+$(this).attr('id')).html());
        $('#recapReponse').show("slow");
        
        socket.emit('recolte-reponse', {token : userToken, 
                                        reponse : $(this).attr('id'),
                                        id: $("#idquestion").val()
        },function (data) {});
    });
    
    
    $("#begin").click(function() {
        pseudo = $('#pseudo').val();
        socket.emit('user', {pseudo : pseudo, room : token}, function (data) {
              userToken = data['userToken'];
              if(userToken != false){
                $('#info-debug').html(userToken);
              }else{
                 $('#info-content').html("Désolé, la partie n'est pas accessible."); 
              }
        });
        
        $('#info-header').html("Bienvenue "+ pseudo );
        $('#info-content').html("Veuillez patientez la partie va bientôt commencer.");
        $('#li-login').hide();
        $('#li-wait').show();
    });
    
    
    /** Event **/
    socket.on('start-party-users-'+token, function(data) {
        if(userToken != false){
            $('#login').hide();
            $("#idquestion").val(data['idquestion']);
            $('#recapReponse').hide("slow");
            $('#command-tool').show("slow");
            $('#reponseSaisie').html("");
            
            $("#reponse1").html(data['reponse1']);
            $("#reponse2").html(data['reponse2']);
            $("#reponse3").html(data['reponse3']);
            $("#reponse4").html(data['reponse4']);
            $('#command-tool').show("slow");  //effet de style
        }
    });
});