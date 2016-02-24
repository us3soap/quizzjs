var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var qr = require('qr-image');
var room = require('room-module');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

/** Gestion des routes **/

/* Home page. */
router.get('/', function(req, res) {
    res.render('index.ejs', {url: req.headers.host});
});


/*Génération du flux correspondant à l'image du QR Code*/
router.get('/new-room', function(req, res) {
    //Création d'une nouvelle room
    var token = room.newRoom();
    room.getRoom(token).open();
    //On affiche l'url du site
    var urlQr = req.protocol+'://'+req.headers.host+'/room/'+token;
    var code = qr.image(urlQr, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    console.log('qr-code affiché : '+ urlQr );
});



/* Page reserve a un utilisateur */
router.get('/room/:token', function(req, res) {
    console.log("Welcome to room : ["+req.params.token+"]");
    room.getRoom(req.params.token).setName("Room : ["+req.params.token+"]");
    res.render('user.ejs', {url: req.headers.host, room: req.params.token});
});

/* Page question d'une room */
router.get('/room/:token/game', function(req, res) {
    console.log("Game for room : ["+req.params.token+"]");
    /* On ferme la room, les joueurs ne peuvent plus rejoindre */
    room.getRoom(req.params.token).close();
});

/* Page resultat d'une room */
router.get('/room/:token/result', function(req, res) {
    console.log("Result for room : ["+req.params.token+"]");
});

/** Socket **/

// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    
    socket.on('user', function (data, fn) {
        console.log('Inscription de : ' + data["pseudo"] + ' dans la room ' + data["room"]);
        var userToken = room.getRoom(data["room"]).memberJoin();
        // Si le user est valide, on l'ajoute sur la page de la room.
        if(userToken){
            socket.broadcast.emit('new-user', data["pseudo"]);
        }
        
        //Le token est retourné au client pour identifier les traitements
        fn(userToken);
    });
});

/** Serveur **/
server.listen(process.env.PORT, process.env.IP, function(){
    var addr = server.address();
    router.use(express.static(__dirname + '/public'));
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});