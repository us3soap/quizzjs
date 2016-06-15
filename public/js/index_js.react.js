(function () {
    var $players = document.querySelector('.players'),
        $canvas = $players.querySelector('.canvas-wrapper'),
        $instruction = document.querySelector('.instruction'),
        $howto = document.querySelector('.howto'),
        $questionWrapper = document.querySelector('.question-wrapper'),
        $question = $questionWrapper.querySelector('.question'),
        $reponse1 = $questionWrapper.querySelector('#reponse1'),
        $reponse2 = $questionWrapper.querySelector('#reponse2'),
        $reponse3 = $questionWrapper.querySelector('#reponse3'),
        $reponse4 = $questionWrapper.querySelector('#reponse4'),
        $divReponse1 = $questionWrapper.querySelector('#divreponse1'),
        $divReponse2 = $questionWrapper.querySelector('#divreponse2'),
        $divReponse3 = $questionWrapper.querySelector('#divreponse3'),
        $divReponse4 = $questionWrapper.querySelector('#divreponse4'),
        $scoring = document.querySelector('.scoring');
    
    var cptQuestion = 0,                //compteur de questions posées
        nbReponseRecu = 0,              //nb de réponses utilisateurs pour savoir si tout le monde à repondu et si on passe à la suivante
        bonneReponse = null,            //contient l'id de la bonne réponse
        explicationsReponse = null,     //valeur du champ explication lié à la question
        tempsDeTransition = 6000,       //en ms
        interval = null,                //evenement pour l'avancement du chrono
        eventMAJScore = null,           //evenement pour la progression des scores
        eventQuestion = null,           //evenement question 
        vitesseProgressionScore = 5;    //valeur que prend la progressBar à chaque tick (nb pixel par 40ms)
        
    var socket = io.connect(GLOBAL.url);

    /**
    * Function permettant l'ajout d'un joueur.
    * @arg String token : la clé référençant l'utilisateur.
    * @arg String username : le nom d'utilisateur.
    **/
    function addParticipants(token, username){
        var players = $players.querySelectorAll('.player');
        for (var i = 0, l = players.length, player; i < l; i++) {
            player = players[i];
            if (!player.classList.contains('active')) {
                player.classList.add('active');
                player.querySelector('.pseudo').innerHTML = '<span id="name-' + token + '">' + username + '</span><span id="badge-' + token + '" class="badge badge-display">0</span>';
                player.id = token;
                break;
            }
        }
    }
    
    /**
    * Function permettant la suppression d'un joueur.
    * @arg String token : la clé référençant l'utilisateur.
    * @arg String username : le nom d'utilisateur.
    **/
    function removeParticipant(token, username){
        var player = $players.querySelector('#' + token);
        player.classList.remove('active');
        player.id = '';
        player.querySelector('.pseudo').innerHTML = 'attente';
    }
    
    /**
    * Function permettant la gestion du quota de joueur.
    * @arg int nbUsersActuels : le nombre d'utilisateur connecté.
    **/
    function gererUsersMax(nbUsersActuels){
        if (GLOBAL.nbUsersMax == nbUsersActuels) {
            console.log('nb joueurs atteint');
        } else {
            console.log('manque encore des joueurs');
        }
    }

    /**
    * Function permettant la gestion de la vue à afficher.
    * @arg String la vue à atteindre [wait -> transition -> play -> score]
    **/
    function displayInterface(view){
        console.log('displayInterface, view = ' + view);
        
        switch (view) {
            case 'wait':
            break;
            
            case 'parametrage':
                $instruction.innerHTML = "Salon en cours de parametrage, veuillez patienter.";
                $howto.style.display = 'none';
            break;
            
            case 'join':
                $instruction.innerHTML = "Scanne ce QR Code pour rejoindre la partie.";
                $howto.style.display = 'flex';
                $howto.querySelector('.qrcode-img').src = '/access-room/' + GLOBAL.token;
            break;
            
            case 'transition':
                $instruction.style.display = 'flex';
                $instruction.innerHTML = "Tout le monde est la. Préparez vous !";
                $questionWrapper.style.display = 'none';
                $howto.style.display = 'none';
                $scoring.style.display = 'none';
            break;
            
            case 'play':
                $howto.style.display = 'none';
                $instruction.style.display = 'none';
                $canvas.style.display = 'flex';
                $questionWrapper.style.display = 'flex';
                modifierClassDivReponse("adding","");
                $scoring.style.display = 'none';
                clearInterval(eventMAJScore);
            break;
            
            case 'score':
                $canvas.style.display = 'none';
                modifierClassDivReponse("removed",bonneReponse);
                $scoring.querySelector("#explicationReponse").innerHTML = explicationsReponse;
                setTimeout (function(){$scoring.style.display = 'flex';imageMeilleurJoueur();eventMAJScore = setInterval(modifValues,40);},3000);
            break;
            
            default:
                console.log('Erreur, la vue "' + view + '" n\'est pas connue');
        }
    }


    /**
     * Création de la 'frame' des scores.
     **/
    function showResultat(){
        var divPartieStatic = '<div class="question" id="explicationReponse"></div>'
                            + '<div class="scores">';   //div qui sera fermé en fin de methode
        var divPartieDynamique = "";
        
        var players = $players.querySelectorAll('.player');
        for (var i = 0, l = players.length, player; i < l; i++) {
            player = players[i];
            player.querySelector('.badge').innerHTML = 0;
            
            divPartieDynamique +=   '<div id="progress-' + player.id + '" class="progressbar" data-perc="40">'
	                           +        '<div class="bar color' + (i+1) + '" width="0"><span></span></div>'
	                           +        '<div class="label"><span></span><div class="perc"></div></div>'
                               +    '</div>';
        }
        
        $scoring.innerHTML = divPartieStatic + divPartieDynamique + '</div>';
    }
    
    /**
     * Fonction qui gere la progression des scores de tous les joueurs à la fin d'une question.
     **/
    function modifValues(){
        
        var players = $players.querySelectorAll('.player');
        for (var i = 0, l = players.length, player; i < l; i++) {
            player = players[i];
            var t = $scoring.querySelector('#progress-' + player.id),
            dataperc = player.querySelector('.badge').innerHTML / GLOBAL.nbQuestions * 100,
    		barperc = Math.round(dataperc*5.56);
    		
    		var valAncien = t.querySelector('.bar').getAttribute('width');
    		
    		//TODO refaire la condition pour virer l'exception 
    		// !! Exception si le user n'a pas eu de bonnes réponses encore, on lui met 0%
    		if (player.querySelector('.badge').innerHTML == 0) {
    		    t.querySelector('.perc').innerHTML = player.querySelector('#name-' + player.id).innerHTML + ' : 0%';
    		} else {
        		if (valAncien<barperc) {
        		    var valNew = (parseInt(valAncien) + vitesseProgressionScore);
        		    t.querySelector('.bar').setAttribute( 'width', valNew);
        		    t.querySelector('.bar').setAttribute( 'style' , 'width:' + (valNew) + 'px');
        		    
            		var length = valNew,
            			perc = Math.trunc(parseInt(length)/5.56),
            			labelpos = (parseInt(length)-2);
            			
            		t.querySelector('.label').setAttribute( 'style', 'left :' + labelpos + 'px');
            		t.querySelector('.perc').innerHTML = player.querySelector('#name-' + player.id).innerHTML + " : " + perc+'%';
        		}
    		}
        }
    }
    
    /**
     * Function permettant de gerer l'image des joueurs en fonction de son score
     **/
     function imageMeilleurJoueur() {
        var players = $players.querySelectorAll('.player');
        var meilleurScore = 0;
        for (var i = 0, l = players.length, player; i < l; i++) {
            player = players[i];
            if (player.querySelector('.badge-display').innerHTML > meilleurScore) {
                meilleurScore = player.querySelector('.badge-display').innerHTML;
            }
        }
        for (var i = 0, l = players.length, player; i < l; i++) {
            player = players[i];
            if (player.querySelector('.badge-display').innerHTML == meilleurScore) {
                player.className = "";
                player.classList.add('player');
                player.classList.add('gagnant');
            } else {
                player.className = "";
                player.classList.add('player');
                player.classList.add('active');
            }
        }
     }
    
    /**
     * Function gérant l'animation des réponses.
     * @arg nomClass classe css a ajouter aux réponses
     * @arg bonneReponse div reponse qui ne doit pas prendre la classe css
     **/
    function modifierClassDivReponse(nomClass,bonneReponse){
        
        //TODO voir si on peut faire plus propre .....
        if (bonneReponse == "reponse1") {
            $divReponse2.className = "";
            $divReponse2.classList.add(nomClass);
            setTimeout (function(){$divReponse3.className = "";$divReponse3.classList.add(nomClass);}, 500);
            setTimeout (function(){$divReponse4.className = "";$divReponse4.classList.add(nomClass);}, 1000);
        } else if (bonneReponse == "reponse2") {
            $divReponse1.className = "";
            $divReponse1.classList.add(nomClass);
            setTimeout (function(){$divReponse3.className = "";$divReponse3.classList.add(nomClass);}, 500);
            setTimeout (function(){$divReponse4.className = "";$divReponse4.classList.add(nomClass);}, 1000);
        } else if (bonneReponse == "reponse3") {
            $divReponse1.className = "";
            $divReponse1.classList.add(nomClass);
            setTimeout (function(){$divReponse2.className = "";$divReponse2.classList.add(nomClass);}, 500);
            setTimeout (function(){$divReponse4.className = "";$divReponse4.classList.add(nomClass);}, 1000);
        } else if (bonneReponse == "reponse4") {
            $divReponse1.className = "";
            $divReponse1.classList.add(nomClass);
            setTimeout (function(){$divReponse2.className = "";$divReponse2.classList.add(nomClass);}, 500);
            setTimeout (function(){$divReponse3.className = "";$divReponse3.classList.add(nomClass);}, 1000);
        } else {
            $divReponse1.className = "cacher";
            $divReponse2.className = "cacher";
            $divReponse3.className = "cacher";
            $divReponse4.className = "cacher";
            $divReponse1.className = "";
            $divReponse1.classList.add(nomClass);
            setTimeout (function(){$divReponse2.className = "";$divReponse2.classList.add(nomClass);}, 500);
            setTimeout (function(){$divReponse3.className = "";$divReponse3.classList.add(nomClass);}, 1000);
            setTimeout (function(){$divReponse4.className = "";$divReponse4.classList.add(nomClass);}, 1500);
        }
    }
         
         
    /** 
     * Functions permettant de comptabiliser et recupérer les questions
     * + création du chrono
     **/
    function myGame() {
        
        if (cptQuestion == GLOBAL.nbQuestions) {
            clearInterval(eventQuestion);
            displayInterface("score");
            setTimeout (function(){
                clearInterval(eventMAJScore);
            },6000);
            setTimeout (function(){
                socket.emit('display-reload-party', {room : GLOBAL.token}, function (data) {});
            },3000);
        } else {
            socket.emit('recup-question', {room : GLOBAL.token}, function (data) {
                nbReponseRecu = 0;
                cptQuestion = cptQuestion + 1;

                $question.innerHTML = data['question'];
                $reponse1.innerHTML = data['reponse1'];
                $reponse2.innerHTML = data['reponse2'];
                $reponse3.innerHTML = data['reponse3'];
                $reponse4.innerHTML = data['reponse4'];
                bonneReponse = data['good'];
                explicationsReponse = data['explication'];
                
                displayInterface("play");
                
                window.clearInterval(interval);
                
                // gestion du timer
                var $timelapsWrapper = document.querySelector('.canvas-wrapper'),
                    $timelaps = document.querySelector('#timelaps'),
                    timelapsCtx = $timelaps.getContext("2d");
            
                var timelapsH = $timelapsWrapper.offsetHeight,
                    timelapsW = $timelapsWrapper.offsetWidth,
                    timelapsCenter = timelapsW / 2;
    
                var r = timelapsW/2,
                    x = 0,
                    y = 0;
                    
                var angle = -90;
                var totalTime = GLOBAL.timerQuestion * 1000; //ms
                var tickInterval = 250;
                var step = tickInterval * 360 / totalTime;
                var tick = 0;
                var nextStep = 0;
                
                timelapsCtx.strokeStyle = "rgb(106, 150, 241)";
                timelapsCtx.lineWidth = 1;
                timelapsCtx.beginPath();
                angle = -90;
                tick = 0;
                timelapsCtx.clearRect(0, 0, timelapsW, timelapsH);
                
                interval = window.setInterval(function () {
                    nextStep = angle + step;
                    
                    while(angle < nextStep){
                        x = r + r*Math.cos(angle*(Math.PI/180));
                        y = r + r*Math.sin(angle*(Math.PI/180));
                        
                        timelapsCtx.moveTo(timelapsW/2, timelapsH/2);
                        timelapsCtx.lineTo(x,y);
                        timelapsCtx.stroke();
                        angle++;
                    }
                    
                    tick += tickInterval;
                    if (tick >= totalTime) {
                        console.log('stop tick ' + (tick/1000) + 's');
                        window.clearInterval(interval);
                        displayInterface("score");
                    }
                }, tickInterval);
            });
        }
    }  
    
    /**
     * Fonction permettant de créer les emplacements des joueurs
     * après que l'admin a selectionné le nb de joueurs.
     */
    function createPlayers() {
        var playerAvatars = '';
        for ( var i = 0; i < GLOBAL.nbUsersMax; i++) {
            playerAvatars += '<div class="player"><div class="pseudo">attente</div></div>';
        }
        $players.innerHTML = playerAvatars + $players.innerHTML;
    }
    
    // gestion du socket
    socket
    
        //socket ajout d'un joueur dans le salon
        .on('new-user-' + GLOBAL.token, function(data) { 
            addParticipants(data['usertoken'], data['user']);
            gererUsersMax(data['nbUsers']);
            
        })
        
        //socket suppression d'un joueur (suite deconnexion)
        .on('user-left-' + GLOBAL.token, function(data) {
            removeParticipant(data['usertoken'], data['username']);
            gererUsersMax(data['nbUsers']);
        })
        
        //socket lancement d'un partie nombre de joueur suffisant
        .on('start-party-room-' + GLOBAL.token, function(user) {
            
            displayInterface("transition");
            showResultat();
            
            setTimeout (function(){
                socket.emit('start', {room : GLOBAL.token}, function (data) {
                    console.log("start OK");
                    cptQuestion = 0;
                    //Je lance ma fonction en même temps que l'event
                    //car la première itération de mon event se fait au bon de 10 sec.
                    myGame();
                    //ici, une question durera xx secondes, paramétré par l'utilisateur, 10 secondes par défaut.
                    eventQuestion = setInterval(myGame, ((GLOBAL.timerQuestion * 1000) + tempsDeTransition) );
                });
            }, 5000);
        })
        
        //socket mise a jour score après reponse d'un utilisateur
        .on('maj-party-users-' + GLOBAL.token, function(data) {
            $players.querySelector('#badge-' + data['usertoken']).innerHTML = parseInt($players.querySelector('#badge-' + data['usertoken']).innerHTML) + data['nbPoint'];
            
            console.log('maj-party-users');
            console.log(data);
            
            nbReponseRecu++;
            //si tout le monde a repondu alors transition et on passe à la question suivante.
            if (GLOBAL.nbUsersMax==nbReponseRecu) {
                window.clearInterval(eventQuestion);
                window.clearInterval(interval);
                displayInterface("score");
                
                //relance question dans 6 secondes (après le recap des scores)
                if (cptQuestion < GLOBAL.nbQuestions) {
                    setTimeout (function(){
                        myGame();
                        eventQuestion = setInterval(myGame, ((GLOBAL.timerQuestion * 1000) + tempsDeTransition ) );
                    },tempsDeTransition);
                } else {
                    setTimeout (function(){
                        clearInterval(eventMAJScore);
                    },6000);
                    setTimeout (function(){
                        socket.emit('display-reload-party', {room : GLOBAL.token}, function (data) {});
                    },3000);
                    
                }
            }
        })
        
        //socket création d'une partie avec les params que l'utilisateur a saisi.
        .on('create-room-' + GLOBAL.token, function(data) { 
            GLOBAL.nbUsersMax = data['nbUsersMax'];
            GLOBAL.nbQuestions = data['nbQuestions'];
            GLOBAL.timerQuestion = data['timerQuestion'];
            
            displayInterface("join");
            createPlayers();
        })
        
}());