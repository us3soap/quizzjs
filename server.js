var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');
var qr = require('qr-image');
var room = require('./quizzjs/room/index.js');
var questionnaire = require("./quizzjs/questionnaire/index.js");

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

var questions = require('./resources/questions.json');

/** Gestion des routes **/

/** Home page.
*   Cette page permet de diffuser le QRcode pour paramétrage du questionnaire
*   @return url : l'url sur laquelle est diffusée les évènements
*   @return token : le token référençant la page a accédée.
*   @return ready2play : l'indicateur permettant de conditionnant le QRcode [true=>la partie est administrée, false=> en attente de paramétrage]
**/
router.get('/', function(req, res) {

    //Création d'une nouvelle room
    var token = room.newRoom();
    var myRoom = room.getRoom(token).open();

    res.render('index.ejs', {url: req.protocol+'://'+req.headers.host,
                            token: token,
<<<<<<< HEAD
                            ready2play: myRoom.isReady()
=======
                            nbUsers : room.getRoom(token).getMembers().length,
                            nbUsersMax : 0,
                            nbQuestions : 10,
                            timerQuestion : 10
>>>>>>> prob01
    });
});

/** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée/
*   L'image générée est à afficher pour rejoindre la room.
*   @param token : identifiant de la salle à rejoindre.
*   @return qrcode : image symbolisant une adresse de type /access-room/idToken
**/
router.get('/access-room/:token', function(req, res) {
    var myRoom = room.getRoom(req.params.token);

<<<<<<< HEAD
    if(myRoom != false) {
      //On affiche l'url du site
      var urlQr = req.protocol+'://'+req.headers.host+'/room/'+req.params.token;
      var code = qr.image(urlQr, { type: 'svg' });
      res.type('svg');
      code.pipe(res);
      console.log('qr-code affiché : '+ urlQr );
    }
=======
/* Admin page */
router.get('/admin/:token', function(req, res) {
    res.render('admin.ejs', {url: req.headers.host,room: req.params.token });
>>>>>>> prob01
});

/** Génération du flux correspondant à l'image du QR Code pour rejoindre une partie paramétrée
*   L'image générée est à afficher pour rejoindre la room.
*   @param token : identifiant de la salle à paramétrer.
*   @return qrcode : image symbolisant une adresse de type /admin-room/idToken
**/
router.get('/admin-room/:token', function(req, res) {
  var myRoom = room.getRoom(req.params.token);

  if(myRoom != false) {
    //On affiche l'url du site
    var urlQr = req.protocol+'://'+req.headers.host+'/admin/'+req.params.token;
    var code = qr.image(urlQr, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    console.log('qr-code affiché : '+ urlQr );
  }
});

/** Admin page
*   @param token : identifiant de la salle à paramétrer.
*   @return url : url à intérargir pour les sockets
*   @return room : id de la room à administrer (la valeur est forcée à false si une erreur est remontée)
*   @return error : les erreurs à remonter en cas d'anomalie
**/
router.get('/admin/:token', function(req, res) {

    var myRoom = room.getRoom(req.params.token);
    res.render('admin.ejs', {url: req.headers.host});

    if(var myRoom != false) {
        if(! room.getRoom(req.params.token).isReady()){
            console.log("Welcome to room : ["+req.params.token+"]");
            myRoom.setName("Room : ["+req.params.token+"]");
            res.render('admin.ejs', {url: req.protocol+'://'+req.headers.host,
                                    room: req.params.token,
                                    error: null
          });
        }else{
          console.log("La room est déjà paramétrée.");
          res.render('admin.ejs', {url: null,
                                  token: null,
                                  error: "La room est déjà paramétrée."
          });
        }
    }else{
        console.log("La room n'existe pas.");
        res.render('admin.ejs', {url: null,
                                token: null,
                                error: "La room n'existe pas."
        });
    }
});

/** User page
*   @param token : identifiant de la salle à rejoindre.
*   @return url : url à intérargir pour les sockets
*   @return room : id de la room à administrer (la valeur est forcée à false si une erreur est remontée)
*   @return error : les erreurs à remonter en cas d'anomalie
**/
router.get('/room/:token', function(req, res) {

    var myRoom = room.getRoom(req.params.token);

    if(myRoom!= false) {
        if(room.getRoom(req.params.token).isOpen()){
            if(room.getRoom(req.params.token).isReady()){
              console.log("Welcome to room : ["+req.params.token+"]");
              room.getRoom(req.params.token).setName("Room : ["+req.params.token+"]");
              res.render('user.ejs', {url: req.protocol+'://'+req.headers.host,
                                    room: req.params.token,
                                    error: false
              });
            }else{
              console.log("La room n'a pas encore configurée.");
              res.render('user.ejs', {url: false,
                                    room: false,
                                    error: "La room n'a pas encore configurée."
              });
            }

        }else{
          console.log("La room n'est pas accessible.");
          res.render('user.ejs', {url: false,
                                room: false,
                                error: "La room n'est pas accessible."
          });
        }
    }else{
        console.log("La room n'existe pas.");
        res.render('user.ejs', {url: false,
                              room: false,
                              error: "La room n'existe pas."
        });
    }
});

/* creation d'une room avec les paramètres */
/** @deprecated **/
/*router.get('/paramRoom/:tabParam', function(req, res) {
    console.log("tabParam : "+ req.params.tabParam);
    var tabParam = JSON.parse(req.params.tabParam);
    console.log("nbUsersMax : " + tabParam.nbUsersMax);
    console.log("nbQuestions : " + tabParam.nbQuestions);
    console.log("timerQuestion : " + tabParam.timerQuestion);
    console.log("nbNouvellesQuestions : " + tabParam.nbNouvellesQuestions);
    console.log("NouvellesQuestions JSON : " + tabParam.nouvellesQuestions);

    //Si l'utilisateur a saisi des questions alors
    //on remplace les questions par defaut par les siennes
    if (tabParam.nbNouvellesQuestions > 0) {
        var tabNouvellesQuestions = JSON.parse(tabParam.nouvellesQuestions);
        questionnaire.loadQuestionnaire(tabNouvellesQuestions, tabParam.room);
    } else {
        questionnaire.loadQuestionnaire(questions, tabParam.room);
    }
<<<<<<< HEAD
    room.getRoom(token).open();
    room.getRoom(token).setMinNbMembers(tabParam.nbUsersMax);
    room.getRoom(token).setMaxNbMembers(tabParam.nbUsersMax);

    res.render('index.ejs', {url: req.headers.host,
=======
    room.getRoom(tabParam.room).open();
    room.getRoom(tabParam.room).setMinNbMembers(tabParam.nbUsersMax);
    room.getRoom(tabParam.room).setMaxNbMembers(tabParam.nbUsersMax);
    
    io.sockets.on('admon-OK', function (socket) {
        socket.broadcast.emit('create-room', {
            nbUsers : room.getRoom(tabParam.room).getMembers().length,
            nbUsersMax : tabParam.nbUsersMax,
            nbQuestions : tabParam.nbQuestions,
            timerQuestion : tabParam.timerQuestion
        });
    });
                                                          
    res.render('user.ejs', {url: req.headers.host, room: tabParam.room});
    
    /*res.render('index.ejs', {url: req.headers.host, 
>>>>>>> prob01
        token: token,
        nbUsers : room.getRoom(token).getMembers().length,
        nbUsersMax : tabParam.nbUsersMax,
        nbQuestions : tabParam.nbQuestions,
        timerQuestion : tabParam.timerQuestion
<<<<<<< HEAD
    });
});*/
=======
    });*/
});

/*Génération du flux correspondant à l'image du QR Code*/
router.get('/new-room/:token', function(req, res) {
    
    //On affiche l'url du site
    var urlQr = req.protocol+'://'+req.headers.host+'/room/'+req.params.token;
    var code = qr.image(urlQr, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    console.log('qr-code affiché : '+ urlQr );
});
>>>>>>> prob01

/*Génération du flux correspondant à l'image du QR Code*/
router.get('/admin-room/:token', function(req, res) {
    
    //On affiche l'url du site
    var urlQr = req.protocol+'://'+req.headers.host+'/admin/'+req.params.token ;
    var code = qr.image(urlQr, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    console.log('qr-code affiché : '+ urlQr );
});


/** Socket **/

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    // Socket de connexion d'un nouveau joueur.
    socket.on('user', function (data, fn) {
        console.log('Inscription de : ' + data["pseudo"] + ' dans la room ' + data["room"]);
        var userToken = room.getRoom(data["room"]).memberJoin();
        // Si le user est valide, on l'ajoute sur la page de la room.
        if(userToken){

            //Sauvegarde du username et de la room dans la session
            socket.username = data["pseudo"];
            socket.room = data["room"];
            socket.token = userToken;
            socket.score = 0;

            socket.broadcast.emit('new-user-'+data["room"], {user : data["pseudo"],
                                                                usertoken : userToken,
                                                                nbUsers : room.getRoom( data["room"]).getMembers().length});
        }

        if(! room.getRoom(data["room"]).notEnough()){
            socket.broadcast.emit('start-party-room-'+data["room"]);
        }

        //Le token est retourné au client pour identifier les traitements
        fn({userToken:userToken});
    });

    // Socket permettant le lancement de la partie.
    socket.on('start', function (data, fn) {
        console.log('Debut de la party : '+data["room"]);
        room.getRoom(data["room"]).close();
        socket.broadcast.emit('cycle-question');
        fn(true);
    });

    //socket d'écoute pour renvoyer une question aléa aux clients (index + user).
    socket.on('recup-question', function (data, fn) {
        var fluxQuestion = questionnaire.getQuestionnaire(data["room"]).getFluxQuestionAleatoire();
        socket.broadcast.emit('start-party-users-'+data["room"], fluxQuestion);
        fn(fluxQuestion);
    });

    socket.on('recolte-reponse', function (data, fn) {
        if(questionnaire.getQuestionnaire(socket.room).checkResponse(data["id"], data["reponse"])){
            socket.score++;
        }
        socket.broadcast.emit('maj-party-users-'+socket.room, {score : socket.score,
                                                                   usertoken : socket.token
                                                                   });
        fn(true);
    });

    //socket de deconnexion d'un joueur.
    socket.on('disconnect', function () {
        if(room.getRoom(socket.room) != false){
            room.getRoom(socket.room).memberLeave(socket.token);

            socket.broadcast.emit('user-left-'+socket.room, {
                username: socket.username,
                usertoken: socket.token,
                nbUsers : room.getRoom(socket.room).getMembers().length
            });
        }
    });
<<<<<<< HEAD

=======
    
    //socket pour cacher le QR CODE admin et afficher page d'attente.
    socket.on('start-admin', function () {
        console.log('start-admin');
        socket.broadcast.emit('token-admin-pris', {
                
        });
    });
>>>>>>> prob01
});

/* Access page */
/** @deprecated **/
/*router.get('/access', function(req, res) {
    res.render('access.ejs', {room : true});
});*/

/* Room page. */
/** @deprecated **/
/*router.get('/direct/:token', function(req, res) {
    console.log("token : "+ req.params.token);
    if(req.params.token != null){
        if(room.getRoom(req.params.token).isOpen()){
            res.render('index.ejs', {url: req.headers.host,
                                    token: req.params.token,
                                    nbUsers : room.getRoom(req.params.token).getMembers().length,
                                    nbUsersMax : room.getRoom(req.params.token).getMinNbMembers(),
                                    nbQuestions : 10,
                                    timerQuestion : 10
            });
        }
    }
});*/

/** Serveur **/
server.listen(process.env.PORT, process.env.IP, function(){
    var addr = server.address();
    router.use(express.static(__dirname + '/public'));
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});
