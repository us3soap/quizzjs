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

/** Variable serveur **/
var port = 5002;


/** Gestion des routes **/

/* Home page. */
router.get('/', function(req, res) {
    res.render('index.ejs', {title: "test"});
});

/*Génération du flux correspondant à l'image du QR Code*/
router.get('/new-player', function(req, res) {
    //Création d'une nouvelle room
    var token = room.newRoom();
    //On affiche l'url du site
    var urlQr = req.protocol+'://'+req.headers.host+'/room/'+token;
    var code = qr.image(urlQr, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    console.log('qr-code affiché :'+urlQr);
});

/* Page reserve a un utilisateur */
router.get('/room/:token', function(req, res) {
    console.log("Welcome to room : ["+req.params.token+"]");
    room.getRoom(req.params.token).setName("Room : ["+req.params.token+"]");
    res.render('user.ejs', {port: port});
});

/** Socket **/
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un utilisateur est connecté !');

    // Quand le serveur reçoit un signal le pseudo on le stocke
    socket.on('user', function (pseudo) {
        console.log('Qui est là? C\'est : ' + pseudo);
    });
});

/** Serveur **/
server.listen(process.env.PORT || port, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    router.use(express.static(__dirname + '/public'));
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});
