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
                _socket = io.connect('http://' + this.props.url);

            this.setState({ socket: _socket });

            _socket.on('start-party-users-' + this.props.token, function (data) {
                that.setState({ question: data });
                that.setState({ partyStarted: true });
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
                    'ul',
                    { className: 'pages' },
                    React.createElement(
                        'li',
                        { className: 'login page' },
                        React.createElement(
                            'div',
                            { className: 'form' },
                            React.createElement(
                                'h3',
                                { className: 'title' },
                                'Quel est votre pseudo?'
                            ),
                            React.createElement('input', {
                                className: 'usernameInput',
                                type: 'text',
                                maxLength: '14',
                                autoComplete: 'off',
                                autoFocus: 'true',
                                onChange: this.pseudoOnChange,
                                value: this.state.pseudo
                            }),
                            React.createElement('br', null),
                            React.createElement('br', null),
                            React.createElement(
                                'button',
                                {
                                    type: 'button',
                                    className: 'btn btn-primary',
                                    onClick: this.beginOnClick },
                                'Commencer à jouer'
                            )
                        )
                    )
                );
            } else {
                return React.createElement(
                    'ul',
                    { className: 'pages' },
                    React.createElement(
                        'li',
                        { className: 'login page' },
                        React.createElement(
                            'div',
                            { className: 'form' },
                            React.createElement(
                                'h3',
                                { className: 'title' },
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
                token: this.props.userToken,
                reponse: 'reponse' + btnNo,
                id: this.props.question.idquestion
            }, function (data) {
                console.log(data);
            });
        },
        render: function () {
            return React.createElement(
                'div',
                { className: 'wrapper' },
                (() => {
                    if (this.state.showModalInfo) {
                        return React.createElement(
                            'div',
                            { id: 'modalInfo', tabIndex: '-1', role: 'dialog', ariaLabelledby: 'myModalLabel', ariaHidden: 'true' },
                            React.createElement(
                                'div',
                                { className: 'modal-dialog' },
                                React.createElement(
                                    'div',
                                    { className: 'modal-content' },
                                    React.createElement(
                                        'div',
                                        { className: 'modal-header' },
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'close', dataDismiss: 'modal', ariaLabel: 'Close' },
                                            React.createElement(
                                                'span',
                                                { ariaHidden: 'true' },
                                                '×'
                                            )
                                        ),
                                        React.createElement(
                                            'h4',
                                            { id: 'info-header', className: 'modal-title', id: 'myModalLabel' },
                                            'Bienvenue ',
                                            this.props.pseudo
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'modal-body' },
                                        React.createElement('div', { id: 'info-content' }),
                                        React.createElement('div', { id: 'info-debug' })
                                    )
                                )
                            )
                        );
                    }
                })(),
                (() => {
                    if (this.state.showCommandTool) {
                        return React.createElement(
                            'div',
                            { id: 'command-tool', className: 'flex-container' },
                            React.createElement(
                                'button',
                                {
                                    type: 'button',
                                    className: 'btn btn-success',
                                    onClick: this.reponseOnclick.bind(this, 1) },
                                this.props.question.reponse1
                            ),
                            React.createElement(
                                'button',
                                {
                                    type: 'button',
                                    className: 'btn btn-info',
                                    onClick: this.reponseOnclick.bind(this, 2) },
                                this.props.question.reponse2
                            ),
                            React.createElement(
                                'button',
                                {
                                    type: 'button',
                                    className: 'btn btn btn-warning',
                                    onClick: this.reponseOnclick.bind(this, 3) },
                                this.props.question.reponse3
                            ),
                            React.createElement(
                                'button',
                                {
                                    type: 'button',
                                    className: 'btn btn btn-danger',
                                    onClick: this.reponseOnclick.bind(this, 4) },
                                this.props.question.reponse4
                            )
                        );
                    }
                })(),
                (() => {
                    if (this.state.showRecapReponse) {
                        return React.createElement(
                            'div',
                            { id: 'recapReponse' },
                            React.createElement(
                                'ul',
                                { id: 'login', className: 'pages' },
                                React.createElement(
                                    'li',
                                    { id: 'li-login', className: 'login page' },
                                    React.createElement(
                                        'div',
                                        { className: 'form' },
                                        React.createElement(
                                            'h3',
                                            { className: 'title' },
                                            'Vous avez répondu :'
                                        ),
                                        React.createElement(
                                            'h3',
                                            { className: 'title' },
                                            this.state.reponseDonneeText
                                        )
                                    )
                                )
                            )
                        );
                    }
                })()
            );
        }
    });

    ReactDOM.render(React.createElement(UserView, { url: GLOBAL.url, token: GLOBAL.token }), document.querySelector('#user-view'));
})();