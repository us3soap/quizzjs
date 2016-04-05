(function () {
    'use strict';
    
    
    /**
     * composant principal
     */
    var UserView = React.createClass({
        getDefaultProps: function () {
            return {
                url: '',
                token: '',                
            };
        },
        getInitialState: function () {
            return {
                socket: null,
                partyStarted: false,
                userToken: '',
                pseudo: '',
                question: {},
            };
        },
        /**
        * pose écouteur sur le socket pour démarrer la partie
        */
        componentDidMount: function () {
            var that = this,
                _socket = io.connect('http://'+ this.props.url);
                
            this.setState({socket: _socket});
            
            _socket.on('start-party-users-' + this.props.token, function(data) {
                 that.setState({question: data});
                 that.setState({partyStarted : true});
            });
        },
        /**
        * le user s'est authentifié
        */
        loginHandler: function (_userToken, _pseudo) {
            this.setState({userToken: _userToken});
            this.setState({pseudo: _pseudo});
        },
        /**
        * affiche le pad ou le login form
        */
        render: function (){ 
            if (this.state.partyStarted) {
                return (
                    <UserPadView 
                        socket={this.state.socket} 
                        userToken={this.state.userToken} 
                        pseudo={this.state.pseudo}
                        question={this.state.question} />
                );
            } else {
                return (
                    <UserLoginView 
                        socket={this.state.socket} 
                        token={this.props.token} 
                        loginHandler={this.loginHandler} />
                );
            }
        } 
    });
    
    /**
     * formulaire de connexion à une partie
     */
    var UserLoginView = React.createClass({
        getInitialState: function () {
            return {
                alreadyLogged : false,
                pseudo: '',
                msgInfo: '',
                msgDebug: '',
            };
        },
        pseudoOnChange: function (e) {
            this.setState({pseudo: e.target.value});
        },
        /**
        * le joueur s'authentifie
        */
        beginOnClick: function () {
            var that = this;
            this.props.socket.emit('user', {pseudo : this.state.pseudo, room : this.props.token}, function (data) {
                var _userToken = data['userToken'];
                
                if(_userToken != false){
                    that.props.loginHandler(_userToken, that.state.pseudo);
                    
                    that.setState({msgDebug: _userToken});
                    that.setState({alreadyLogged: true});
                }else{
                    that.setState({msgInfo: "Désolé, la partie n'est pas accessible."}); 
                }
            });
        },
        render: function () {
            if (this.state.alreadyLogged === false) {
                return (
                    <div className="login-wrapper">
                        <div className="login-form">
                            <h3>Quel est votre pseudo?</h3>
                            <input 
                                type="text"
                                maxLength="14"
                                autoComplete="off"
                                autoFocus="true"
                                onChange={this.pseudoOnChange}
                                value={this.state.pseudo}
                            />
                            <button onClick={this.beginOnClick}>
                                Commencer à jouer
                            </button>
                        </div>
                    </div>
                );                
            } else {
                return (
                    <div className="wrapper">
                        <h3>{this.state.pseudo}</h3>
                        <div>{this.state.msgInfo}</div>
                        <div>{this.state.msgDebug}</div>
                    </div>
                );
            }
        } 
    });
    
    
    /**
     * game pad
     */
    var UserPadView = React.createClass({
        getInitialState: function (){
            return {
                showModalInfo: false,
                showCommandTool: true,
                showRecapReponse: false,
                reponseDonnee: 0,
                reponseDonneeText: '',
            }  
        },
        /**
        * les propriétés sont mises à jour par une nouvelle question
        */
        componentWillReceiveProps: function () {            
            this.setState({showCommandTool: true});
            this.setState({showRecapReponse: false});
        },
        /**
        * une reponse est donnée
        */
        reponseOnclick: function (btnNo) {
            this.setState({reponseDonnee: btnNo});
            this.setState({reponseDonneeText: this.props.question['reponse' + btnNo]})
            this.setState({showCommandTool: false});
            this.setState({showRecapReponse: true});
            
            this.props.socket.emit(
                'recolte-reponse',
                {
                    token   : this.props.userToken, 
                    reponse : 'reponse' + btnNo,
                    id      : this.props.question.idquestion,
                },
                function (data) {
                    console.log(data);
                }
            );
        },
        render: function () {
            return (
                <div className="wrapper">
                    {
                       (() => {
                            if (this.state.showModalInfo) {
                                return (
                                    <h4>Bienvenue {this.props.pseudo}</h4>
                                );
                            }
                        })()
                    }

                    {
                        (() => {
                            if (this.state.showCommandTool) {
                                return (
                                    <div className="btn-wrapper">
                                        <div className="btn" onClick={this.reponseOnclick.bind(this, 1)}>{this.props.question.reponse1}</div>
                                        <div className="btn" onClick={this.reponseOnclick.bind(this, 2)}>{this.props.question.reponse2}</div>
                                        <div className="btn" onClick={this.reponseOnclick.bind(this, 3)}>{this.props.question.reponse3}</div>
                                        <div className="btn" onClick={this.reponseOnclick.bind(this, 4)}>{this.props.question.reponse4}</div>
                                    </div>
                                );
                            }
                        })()
                    }
                    
                    {
                        (() => {
                            if (this.state.showRecapReponse) {
                                return (
                                    <div>
                                        <h3>Vous avez répondu :</h3>
                                        <h3>{this.state.reponseDonneeText}</h3>
                                    </div>
                                );
                            }
                        })()
                    }
                </div>
            );
        } 
    });
    
    
    ReactDOM.render(
        <UserView url={GLOBAL.url} token={GLOBAL.token} />,
        document.querySelector('#user-view')
    );
    
}());