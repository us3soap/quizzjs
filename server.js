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

/* Home page. */
router.get('/', function(req, res) {
    
    //Création d'une nouvelle room
    var token = room.newRoom();
    room.getRoom(token).open();
    questionnaire.loadQuestionnaire(questions, token);
    
    
    //Parametrage par défaut.
    room.getRoom(token).setMinNbMembers(4);
    
    res.render('index.ejs', {url: req.headers.host, 
                            token: token,
                            nbUsers : room.getRoom(token).getMembers().length,
                            nbUsersMax : room.getRoom(token).getMinNbMembers(),
                            nbQuestions : 10,
                            timerQuestion : 10
    });
});


/* Admin page */
router.get('/admin', function(req, res) {
    res.render('admin.ejs', {url: req.headers.host});
});

/* Access page */
router.get('/access', function(req, res) {
    res.render('access.ejs', {room : true});
});

/* Room page. */
router.get('/direct/:token', function(req, res) {
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
});

/* creation d'une room avec les paramètres */
router.get('/paramRoom/:tabParam', function(req, res) {
    console.log("tabParam : "+ req.params.tabParam);
    var tabParam = JSON.parse(req.params.tabParam);
    console.log("nbUsersMax : " + tabParam.nbUsersMax);
    console.log("nbQuestions : " + tabParam.nbQuestions);
    console.log("timerQuestion : " + tabParam.timerQuestion);
    
    //récupération des questions saisies par l'utilisateur.
    //TODO ajouter ces questions à "questionnaire"
    console.log("nbNouvellesQuestions : " + tabParam.nbNouvellesQuestions);
    console.log("NouvellesQuestions JSON : " + tabParam.nouvellesQuestions);
    var tabNouvellesQuestions = JSON.parse(tabParam.nouvellesQuestions);
    console.log("Question 1 : " + tabNouvellesQuestions.question1);
    
    //Création d'une nouvelle room
    var token = room.newRoom();
    questionnaire.loadQuestionnaire(questions, token);
    room.getRoom(token).open();
    room.getRoom(token).setMinNbMembers(tabParam.nbUsersMax);
    room.getRoom(token).setMaxNbMembers(tabParam.nbUsersMax);
     
    res.render('index.ejs', {url: req.headers.host, 
        token: token,
        nbUsers : room.getRoom(token).getMembers().length,
        nbUsersMax : tabParam.nbUsersMax,
        nbQuestions : tabParam.nbQuestions,
        timerQuestion : tabParam.timerQuestion
    });
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



/* Page reserve a un utilisateur */
router.get('/room/:token', function(req, res) {
    
    console.log("test existance de la room " + req.params.token);
    if(room.getRoom(req.params.token) != false) {
        console.log("La room existe.");
        if(room.getRoom(req.params.token).isOpen()){
            console.log("Welcome to room : ["+req.params.token+"]");
            room.getRoom(req.params.token).setName("Room : ["+req.params.token+"]");
            res.render('user.ejs', {url: req.headers.host, room: req.params.token});
        }else{
            res.render('user.ejs', {url: req.headers.host, room: false});
        }
    }else{
        console.log("La room n'existe pas, redirection vers la page access.ejs.");
        res.render('access.ejs', {room: false});
    }
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
            socket.broadcast.emit('maj-party-users-'+socket.room, {score : socket.score, 
                                                                   usertoken : socket.token
                                                                   });
        }
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
    
});

/** Serveur **/
server.listen(process.env.PORT, process.env.IP, function(){
    var addr = server.address();
    router.use(express.static(__dirname + '/public'));
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});
