(function () {
    'use strict';
    
    
    /**
     * composant principal
     */
    var UserView = React.createClass({
        getInitialState: function () {
            return {
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
            var that = this;
            this.props.socket.on('start-party-users-' + this.props.token, function(data) {
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
                        socket={this.props.socket} 
                        userToken={this.state.userToken} 
                        pseudo={this.state.pseudo}
                        question={this.state.question} />
                );
            } else {
                return (
                    <UserLoginView 
                        socket={this.props.socket} 
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
                    <ul className="pages">
                    <li className="login page">
                        <div className="form">
                            <h3 className="title">Quel est votre pseudo?</h3>
                            <input 
                                className="usernameInput"
                                type="text"
                                maxLength="14"
                                autoComplete="off"
                                autoFocus="true"
                                onChange={this.pseudoOnChange}
                                value={this.state.pseudo}
                            />
                            <br /><br />
                            <button 
                                type="button"
                                className="btn btn-primary"
                                onClick={this.beginOnClick} >
                                Commencer à jouer
                            </button>
                        </div>
                    </li>
                    </ul>
                );                
            } else {
                return (
                    <ul className="pages">
                    <li className="login page">
                        <div className="form">
                            <h3 className="title">{this.state.pseudo}</h3>
                            <div>{this.state.msgInfo}</div>
                            <div>{this.state.msgDebug}</div>
                        </div>
                    </li>
                    </ul>
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
                                    <div id="modalInfo" tabIndex="-1" role="dialog" ariaLabelledby="myModalLabel" ariaHidden="true">
                                        <div className="modal-dialog">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <button type="button" className="close" dataDismiss="modal" ariaLabel="Close"><span ariaHidden="true">&times;</span></button>
                                                    <h4 id="info-header" className="modal-title" id="myModalLabel">Bienvenue {this.props.pseudo}</h4>
                                                </div>
                                                <div className="modal-body">
                                                    <div id="info-content"></div>
                                                    <div id="info-debug"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })()
                    }

                    {
                        (() => {
                            if (this.state.showCommandTool) {
                                return (
                                    <div id="command-tool" className="flex-container">
                                        <button 
                                            type="button" 
                                            className="btn btn-success" 
                                            onClick={this.reponseOnclick.bind(this, 1)}>{this.props.question.reponse1}</button>
                                        <button 
                                            type="button" 
                                            className="btn btn-info" 
                                            onClick={this.reponseOnclick.bind(this, 2)}>{this.props.question.reponse2}</button>
                                        <button 
                                            type="button" 
                                            className="btn btn btn-warning" 
                                            onClick={this.reponseOnclick.bind(this, 3)}>{this.props.question.reponse3}</button>
                                        <button 
                                            type="button" 
                                            className="btn btn btn-danger" 
                                            onClick={this.reponseOnclick.bind(this, 4)}>{this.props.question.reponse4}</button>
                                    </div>
                                );
                            }
                        })()
                    }
                    
                    {
                        (() => {
                            if (this.state.showRecapReponse) {
                                return (
                                    <div id="recapReponse">
                                        <ul id="login" className="pages">
                                            <li id="li-login" className="login page">
                                                <div className="form">
                                                    <h3 className="title">Vous avez répondu :</h3>
                                                    <h3 className="title">{this.state.reponseDonneeText}</h3>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                );
                            }
                        })()
                    }
                </div>
            );
        } 
    });
    
    
    var url    = document.querySelector("#url").value,
        socket = io.connect('http://'+ url),
        token  = document.querySelector("#token").value;

    
    ReactDOM.render(
        <UserView url={url} socket={socket} token={token} />,
        document.querySelector('#user-view')
    );
    
}());