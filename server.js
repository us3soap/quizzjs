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
    res.render('user.ejs', {url: req.headers.host, room: req.params.token});
});

/** Socket **/
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    // Quand le serveur reçoit un signal le pseudo on le stocke
    socket.on('user', function (pseudo) {
        console.log('Inscription de : ' + pseudo);
        socket.broadcast.emit('new-user', pseudo);
    });
});

/** Serveur **/
server.listen(process.env.PORT, process.env.IP, function(){
    var addr = server.address();
    router.use(express.static(__dirname + '/public'));
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});