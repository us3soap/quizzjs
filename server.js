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
    
    //Création d'une nouvelle room
    var token = room.newRoom();
    room.getRoom(token).open();
    room.getRoom(token).setMinNbMembers(2);
    
    res.render('index.ejs', {url: req.headers.host, token: token});
});


/* Room page. */
router.get('/direct/:token', function(req, res) {
    console.log("token : "+ req.params.token);
    if(req.params.token != null){
        if(room.getRoom(req.params.token).isOpen()){
            res.render('index.ejs', {url: req.headers.host, token: req.params.token});
        }
    }

    
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
    if(room.getRoom(req.params.token).isOpen()){
        console.log("Welcome to room : ["+req.params.token+"]");
        room.getRoom(req.params.token).setName("Room : ["+req.params.token+"]");
        res.render('user.ejs', {url: req.headers.host, room: req.params.token});
    }else{
        res.render('user.ejs', {url: req.headers.host, room: false});
    }
});

/** Socket **/

// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    
    socket.on('user', function (data, fn) {
        console.log('Inscription de : ' + data["pseudo"] + ' dans la room ' + data["room"]);
        var userToken = room.getRoom(data["room"]).memberJoin();
        var go = false;
        // Si le user est valide, on l'ajoute sur la page de la room.
        if(userToken){
            socket.broadcast.emit('new-user-'+data["room"], data["pseudo"]);
        }
        
        if(! room.getRoom(data["room"]).notEnough()){
            socket.broadcast.emit('start-party-room-'+data["room"]);
        }
        
        //Le token est retourné au client pour identifier les traitements
        fn({userToken:userToken});
    });
    
    socket.on('start', function (data, fn) {
        
        console.log('Debut de la party : '+data["room"]);
        room.getRoom(data["room"]).close();
        socket.broadcast.emit('start-party-users-'+data["room"]);
        fn(true);

    });
});

/** Serveur **/
server.listen(process.env.PORT, process.env.IP, function(){
    var addr = server.address();
    router.use(express.static(__dirname + '/public'));
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});