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

//Génération du flux correspondant à l'image du QR Code
router.get('/', function(req, res) {
    //On affiche l'url du site
    var code = qr.image(req.protocol+'://'+req.headers.host, { type: 'svg' });
    res.type('svg');
    code.pipe(res);
    console.log('qr-code affiché :'+req.protocol+'://'+req.headers.host);
});


server.listen(process.env.PORT || 3010, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("QuizzJS run to : [", addr.address + ":" + addr.port+"]");
});
