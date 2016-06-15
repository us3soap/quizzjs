(function () {
    'use strict';

    /**
     * composant principal
     */

    var UserView = React.createClass({
        displayName: 'UserView',

        getDefaultProps: function () {
            return {
                url: '',
                token: ''
            };
        },
        getInitialState: function () {
            return {
                socket: null,
                partyStarted: false,
                partyReload: false,
                userToken: '',
                pseudo: '',
                question: {}
            };
        },
        /**
        * pose écouteur sur le socket pour démarrer la partie
        */
        componentDidMount: function () {
            var that = this,
                _socket = io.connect(this.props.url);

            this.setState({ socket: _socket });

            _socket.on('start-party-users-' + this.props.token, function (data) {
                console.log('1this.props.token = ' + that.props.token); 
                that.setState({ question: data });
                that.setState({ partyStarted: true });
                that.setState({ partyReload: false });
            });
            
            _socket.on('reload-party-', function (data) {
                console.log('2this.props.token = ' + that.props.token); 
                console.log('user.ejs : reload-party-token reçu'); 
                that.setState({ partyStarted: false });
                that.setState({ partyReload: true });
                
            });
        },
        /**
        * le user s'est authentifié
        */
        loginHandler: function (_userToken, _pseudo) {
            this.setState({ userToken: _userToken });
            this.setState({ pseudo: _pseudo });
        },
        /**
        * affiche le pad ou le login form
        */
        render: function () {
            if (this.state.partyStarted) {
                return React.createElement(UserPadView, {
                    socket: this.state.socket,
                    userToken: this.state.userToken,
                    pseudo: this.state.pseudo,
                    question: this.state.question });
            } else if (this.state.partyReload) {
                return React.createElement(UserReloadPartiView, {
                    socket: this.state.socket,
                    userToken: this.state.userToken,
                    pseudo: this.state.pseudo });
            } else {
                return React.createElement(UserLoginView, {
                    socket: this.state.socket,
                    token: this.props.token,
                    loginHandler: this.loginHandler });
            }
        }
    });

    /**
     * formulaire de connexion à une partie
     */
    var UserLoginView = React.createClass({
        displayName: 'UserLoginView',

        getInitialState: function () {
            return {
                alreadyLogged: false,
                pseudo: '',
                msgInfo: '',
                msgDebug: ''
            };
        },
        pseudoOnChange: function (e) {
            this.setState({ pseudo: e.target.value });
        },
        /**
        * le joueur s'authentifie
        */
        beginOnClick: function () {
            var that = this;
            this.props.socket.emit('user', { pseudo: this.state.pseudo, room: this.props.token }, function (data) {
                var _userToken = data['userToken'];

                if (_userToken != false) {
                    that.props.loginHandler(_userToken, that.state.pseudo);

                    that.setState({ msgDebug: _userToken });
                    that.setState({ alreadyLogged: true });
                } else {
                    that.setState({ msgInfo: "Désolé, la partie n'est pas accessible." });
                }
            });
        },
        render: function () {
            if (this.state.alreadyLogged === false) {
                return React.createElement(
                    'div',
                    { className: 'login-wrapper' },
                    React.createElement(
                        'div',
                        { className: 'login-form' },
                        React.createElement(
                            'h3',
                            null,
                            'Quel est votre pseudo?'
                        ),
                        React.createElement('input', {
                            type: 'text',
                            maxLength: '14',
                            autoComplete: 'off',
                            autoFocus: 'true',
                            onChange: this.pseudoOnChange,
                            value: this.state.pseudo
                        }),
                        React.createElement(
                            'button',
                            { onClick: this.beginOnClick },
                            'Commencer à jouer'
                        )
                    )
                );
            } else {
                return React.createElement(
                    'div',
                    { className: 'login-wrapper' },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h3',
                            null,
                            'Bienvenue ',
                            this.state.pseudo
                        ),
                        React.createElement(
                            'div',
                            null,
                            this.state.msgInfo
                        ),
                        React.createElement(
                            'div',
                            null,
                            this.state.msgDebug
                        )
                    )
                );
            }
        }
    });

    /**
     * game pad
     */
    var UserPadView = React.createClass({
        displayName: 'UserPadView',

        getInitialState: function () {
            return {
                showModalInfo: false,
                showCommandTool: true,
                showRecapReponse: false,
                reponseDonnee: 0,
                reponseDonneeText: ''
            };
        },
        /**
        * les propriétés sont mises à jour par une nouvelle question
        */
        componentWillReceiveProps: function () {
            this.setState({ showCommandTool: true });
            this.setState({ showRecapReponse: false });
        },
        /**
        * une reponse est donnée
        */
        reponseOnclick: function (btnNo) {
            this.setState({ reponseDonnee: btnNo });
            this.setState({ reponseDonneeText: this.props.question['reponse' + btnNo] });
            this.setState({ showCommandTool: false });
            this.setState({ showRecapReponse: true });

            this.props.socket.emit('recolte-reponse', {
                reponse: 'reponse' + btnNo,
                id: this.props.question.idquestion
            }, function (data) {
                console.log(data);
            });
        },
        render: function () {
            return React.createElement(
                'div',
                { className: 'pad-wrapper' },
                (() => {
                    if (this.state.showModalInfo) {
                        return React.createElement(
                            'h4',
                            null,
                            'Bienvenue ',
                            this.props.pseudo
                        );
                    }
                })(),
                (() => {
                    if (this.state.showCommandTool) {
                        return React.createElement(
                            'div',
                            { className: 'btn-wrapper' },
                            React.createElement(
                                'div',
                                { className: 'btn', onClick: this.reponseOnclick.bind(this, 1) },
                                this.props.question.reponse1
                            ),
                            React.createElement(
                                'div',
                                { className: 'btn', onClick: this.reponseOnclick.bind(this, 2) },
                                this.props.question.reponse2
                            ),
                            React.createElement(
                                'div',
                                { className: 'btn', onClick: this.reponseOnclick.bind(this, 3) },
                                this.props.question.reponse3
                            ),
                            React.createElement(
                                'div',
                                { className: 'btn', onClick: this.reponseOnclick.bind(this, 4) },
                                this.props.question.reponse4
                            )
                        );
                    }
                })(),
                (() => {
                    if (this.state.showRecapReponse) {
                        return React.createElement(
                            'div',
                            { className: 'recap-wrapper' },
                            React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'h3',
                                    null,
                                    'Vous avez répondu :'
                                ),
                                React.createElement(
                                    'h3',
                                    null,
                                    this.state.reponseDonneeText
                                )
                            )
                        );
                    }
                })()
            );
        }
    });
    
    /**
     * formulaire de relance partie
     */
    var UserReloadPartiView = React.createClass({
        displayName: 'UserReloadPartiView',

        getInitialState: function () {
            return {
                alreadyLogged: false,
                pseudo: '',
                msgInfo: '',
                msgDebug: ''
            };
        },
        reloadSameParty: function () {
            var that = this;
            this.props.socket.emit('reloadParty', { displayAdmin: false, pseudo: this.state.pseudo, room: this.props.token }, function (data) {
                /*var _userToken = data['userToken'];

                if (_userToken != false) {
                    that.props.loginHandler(_userToken, that.state.pseudo);

                    that.setState({ msgDebug: _userToken });
                    that.setState({ alreadyLogged: true });
                } else {
                    that.setState({ msgInfo: "Désolé, la partie n'est pas accessible." });
                }*/
            });
        },
        reloadAdmin: function () {
            var that = this;
            this.props.socket.emit('reloadParty', { displayAdmin: true, pseudo: this.state.pseudo, room: this.props.token }, function (data) {
                /*var _userToken = data['userToken'];

                if (_userToken != false) {
                    that.props.loginHandler(_userToken, that.state.pseudo);

                    that.setState({ msgDebug: _userToken });
                    that.setState({ alreadyLogged: true });
                } else {
                    that.setState({ msgInfo: "Désolé, la partie n'est pas accessible." });
                }*/
            });
        },
        render: function () {
            return React.createElement(
                'div',
                { className: 'login-wrapper' },
                React.createElement(
                    'div',
                    { className: 'login-form' },
                    React.createElement(
                        'button',
                        { onClick: this.reloadSameParty },
                        'Voulez vous relancer une partie identique ?'
                    ),
                    React.createElement(
                        'button',
                        { onClick: this.reloadAdmin },
                        'Voulez vous relancer une partie avec des paramètres différents ?'
                    )
                )
            );
        }
    });
    
    ReactDOM.render(React.createElement(UserView, { url: GLOBAL.url, token: GLOBAL.token }), document.querySelector('#user-view'));
})();