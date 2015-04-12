var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var qr = require('qr-image');
var room = require('room-module');

// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index.ejs', {title: "test"});
});

//Génération du flux correspondant à l'image du QR Code
router.get('/new-player', function(req, res) {
    //Création d'une nouvelle room
    var token = room.newRoom();
    //On affiche l'url du site
    var urlQr = req.protocol+'://'+req.headers.host+'/room?r='+token;
    var code = qr.image(urlQr, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    console.log('qr-code affiché :'+urlQr);
});


server.listen(process.env.PORT || 3055, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    router.use(express.static(__dirname + '/public'));
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});
