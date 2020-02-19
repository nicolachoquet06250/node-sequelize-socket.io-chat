class Script {
    constructor(page) {
        if(page in this)
            this[page]();
    }

    /**
     * class Notification
     * @returns {{push: push}}
     * @constructor
     */
    Notification() {
        const ask_notification_permission_if_not = () => {
            if (window.Notification && Notification.permission !== "granted")
                return Notification.requestPermission();
            return new Promise((resolve, reject) => {});
        };

        ask_notification_permission_if_not()
            .then(status => console.log(Notification.permission, status)/*Notification.permission = Notification.permission !== status ? status : Notification.permission*/)
            .catch(err => alert(err.message));

        return {
            push: (title, options) => {
                if(Notification.permission === "denied")
                    (new this.Notification()).push(title, options);
                if(Notification.permission === "granted")
                    new Notification(title, options);
            }
        };

    }

    /**
     * static methods
     * @param section
     */
    static showImageAfterLoad(section) {
        section.querySelector('img').style.display = 'block';
        section.querySelector('.mdl-progress').setAttribute('hidden', 'hidden');
    }

    static initAccordionSizes() {
        document.querySelectorAll('.mdl-accordion__content').forEach(accordion => {
            accordion.style.marginTop = '-' + accordion.offsetHeight.toString() + 'px';
        });
    }

    /**
     * propriété notification ( push desktop notification )
     * @returns {{push: push}|*}
     */
    get notification() {
        if(this._notification === undefined) {
            this._notification = new this.Notification();
        }
        return this._notification;
    }

    /**
     * propriété peer
     * @returns {Peer|null}
     */
    get peer() {
        return this._peer || null;
    }
    set peer(peer) {
        this._peer = peer;
    }

    /**
     * propriété lastPeerId
     * @returns {number|null}
     */
    get lastPeerId() {
        return this._lastPeerId || null;
    }
    set lastPeerId(lastPeerId) {
        this._lastPeerId = lastPeerId;
    }

    /**
     * propriété peerConnection
     * @returns {RTCPeerConnection|null}
     */
    get peerConnection() {
        return this._conn || null;
    }
    set peerConnection(conn) {
        this._conn = conn;
    }

    /**
     * propriété call_id
     * @returns {string}
     */
    get call_id() {
        return localStorage.getItem('call_id');
    }
    set call_id(call_id) {
        localStorage.setItem('call_id', call_id);
    }

    get peer_id() {
        if(!localStorage.getItem('peer_id')) {
            localStorage.setItem('peer_id', this.uniqid());
        }
        return localStorage.getItem('peer_id');
    }

    /**
     * propriété stream
     * @returns {MediaStream|null}
     */
    get stream() {
        return this._stream || null;
    }
    set stream(stream) {
        this._stream = stream;
    }

    /**
     * propriété streamRemoteVideoContainer ( HTML )
     * @returns {Element}
     */
    get streamRemoteVideoContainer() {
        return document.querySelector('.remote-videos');
    }

    get localStreamVideo() {
        return document.querySelector('video#local');
    }
    get remoteStreamVideo() {
        return document.querySelector('video#remote');
    }

    /**
     * propriété show_video_call_container ( switch between 2 containers )
     * @param show
     */
    set show_video_call_container(show) {
        switch (show) {
            case true:
                for(let hideInVideoCall of document.querySelectorAll('.hide-on-video-call')) {
                    hideInVideoCall.hidden = true;
                }
                for(let showInVideoCall of document.querySelectorAll('.show-on-video-call')) {
                   showInVideoCall.hidden = false;
                }
                break;
            case false:
                for(let hideInVideoCall of document.querySelectorAll('.hide-on-video-call')) {
                    hideInVideoCall.hidden = false;
                }
                for(let showInVideoCall of document.querySelectorAll('.show-on-video-call')) {
                    showInVideoCall.hidden = true;
                }
                break;
        }
    }

    start_stream() {
        return navigator.mediaDevices.getUserMedia({audio: true, video: true});
    }

    createRemoteVideo(stream) {
        let video = document.createElement('video');
        video.srcObject = stream;
        video.onloadedmetadata = function(e) {
            video.play();
        };
        this.streamRemoteVideoContainer.appendChild(video);
    }

    uniqid(a = "", b = false) {
        let c = Date.now()/1000;
        let d = c.toString(16).split(".").join("");
        while (d.length < 14) {
            d += "0";
        }
        let e = "";
        if (b) {
            e = ".";
            let f = Math.round(Math.random()*100000000);
            e += f;
        }
        return a + d + e;
    }

    /** page scripts */
    index() {
        let user = localStorage.getItem('user');
        if(user !== undefined && user !== null) {
            user = JSON.parse(user);
            const my_name = user.first_name;
            let protocol = 'ws';
            if(window.location.protocol === 'https:') {
                protocol += 's';
            }
            let server = new Socket(`${protocol}://${window.location.host}/`, my_name);

            let peer = new Peer(this.peer_id);

            peer.on("open", function(id) {
                console.log("Connected to PeerServer successfully with ID: " + id);
            });

            peer.on("error", function(err) {
                console.log("An error occured. Error type: " + err.type);

            });

            peer.on("disconnected", function() {
                console.log("Disconnected from signaling server. You ID is taken away. Peer-to-peer connections is still intact");
            });

            peer.on("close", function() {
                console.log("Connection to signaling server and peer-to-peer connections have been killed. You ID is taken away. You have been destroyed");
            });

            peer.on("connection", function(dataConnection) {
                setTimeout(function() {
                    if(confirm(dataConnection.peer + " wants to send data to you. Do you want to accept?")) {
                        acceptDataConnection(dataConnection);
                    }
                    else {
                        dataConnection.close();
                    }
                }, 100)
            });

            peer.on("call", function(mediaConnection) {
                setTimeout(function() {
                    if(confirm("Got a call from " + mediaConnection.peer + ". Do you want to pick the call?")) {
                        acceptMediaConnection(mediaConnection);
                    }
                    else {
                        mediaConnection.close();
                    }
                }, 100);
            });

            let myDataConnection = null;
            let myMediaConnection = null;

            function acceptDataConnection(dataConnection) {
                myDataConnection = dataConnection;

                dataConnection.on("data", function(data) {
                    console.log("Message from " + dataConnection.peer + ".\n" + data)
                });

                dataConnection.on("close", function(data) {
                    console.log("DataConnecion closed");
                });

                dataConnection.on("error", function(err) {
                    console.log("Error occured on DataConnection. Error: " + err);
                });
            }

            const acceptMediaConnection = mediaConnection => {
                myMediaConnection = mediaConnection;

                mediaConnection.on("stream", remoteStream => {
                    this.remoteStreamVideo.srcObject = remoteStream;
                    this.remoteStreamVideo.play();
                });

                mediaConnection.on("close", function(data) {
                    console.log("MediaConnecion closed");
                });

                mediaConnection.on("error", function(err) {
                    console.log("Error occured on MediaConnection. Error: " + err);
                });

                navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(mediaStream => {
                    this.localStreamVideo.srcObject = mediaStream;
                    mediaConnection.answer(mediaStream);
                }).catch(function(e) {
                    console.log("Error with MediaStream: " + e);
                });
            };

            window.addEventListener('beforeunload', e => {
                e.preventDefault();
            });

            function connect(id) {
                console.log('Try to establish data connection');
                establishDataConnection(id);
                console.log('Try to establish media connection');
                establishMediaConnection(id);
            }

            function establishDataConnection(id) {
                let dataConnection = peer.connect(id, {reliable: true, ordered: true});
                myDataConnection = dataConnection;
                dataConnection.on("open", function(){
                    console.log("DataConnecion Established");
                });

                dataConnection.on("data", function(data) {
                    console.log("Message from " + dataConnection.peer + ".\n" + data)
                });

                dataConnection.on("close", function(data) {
                    console.log("DataConnecion closed");
                });

                dataConnection.on("error", function(err) {
                    console.log("Error occured on DataConnection. Error: " + err);
                })
            }

            const establishMediaConnection = id => {
                let mediaConnection = null;

                this.start_stream().then(mediaStream => {
                    this.localStreamVideo.srcObject = mediaStream;
                    mediaConnection = peer.call(id, mediaStream);
                    myMediaConnection = mediaConnection;
                    mediaConnection.on("stream", remoteStream => {
                        this.remoteStreamVideo.srcObject = remoteStream;
                        this.remoteStreamVideo.play();
                    });

                    mediaConnection.on("error", function(err) {
                        console.log("Error occured on MediaConnection. Error: " + err);
                    });

                    mediaConnection.on("close", function(data) {
                        console.log("MediaConnecion closed");
                    });
                }).catch(function(e){
                    console.log("Error with MediaStream: " + e);
                });
            };

            let messages = document.querySelector('.messages');
            let discussions = document.querySelectorAll('.discussions');
            let connected_users = document.querySelector('.connected-users');
            let message = document.querySelector('.message');
            let send_button = document.querySelector('.send');
            let disconnect_button = document.querySelector('.disconnect');
            let add_new_discussion = document.querySelector('.add-new-discussion');

            const save_current_discussion = discussion => {
                localStorage.setItem('current_discussion', discussion.id);
            };
            const get_current_discussion = () => {
                let current_discussion_id = parseInt(localStorage.getItem('current_discussion'));
                if(current_discussion_id) server.emit('get_discussion', {
                    id: server.id,
                    discussion: {
                        id: current_discussion_id
                    }, user
                });
            };
            const add_message_to_list = (message, me, index) => {
                let date = new Date();
                let isToday = true;
                let isYesterday = false;
                let isTwoDaysAgo = false;
                let dateToWrite = null;
                if(message.createdAt) {
                    let _date = new Date();
                    date = new Date(message.createdAt);
                    isToday = date.getDate() === _date.getDate() && date.getMonth() === _date.getMonth() && date.getFullYear() === _date.getFullYear();
                    isYesterday = date.getDate() - 1 === _date.getDate() && date.getMonth() === _date.getMonth() && date.getFullYear() === _date.getFullYear();
                    isTwoDaysAgo = date.getDate() - 2 === _date.getDate() && date.getMonth() === _date.getMonth() && date.getFullYear() === _date.getFullYear();
                }
                if(isToday) dateToWrite = 'Aujourd\'hui';
                else if(isYesterday) dateToWrite = 'Hier';
                else if(isTwoDaysAgo) dateToWrite = 'Il y a 2 jours';
                dateToWrite = (dateToWrite === null ? `Le ${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}/${date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth()}/${date.getFullYear()}` : dateToWrite) + ` à ${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;

                let complete_name = message.author.first_name + (message.author.last_name ? ' ' + message.author.last_name : '');
                let side = me ? 'right' : 'left';
                messages.innerHTML += `<div class="mdl-grid" id="message-${message.discussion}-${date.toISOString().replace(/[:.]/g, '-')}${(index || '')}">
                <div class="mdl-cell mdl-cell--12-col">
                    <div class="bubble ${side} mdl-card mdl-shadow--2dp" style="float: ${side}">
                        <div class="mdl-card__title mdl-card--expand js-dynamic-image" style="overflow: hidden;">
                            <div class="mdl-grid" style="position: absolute; bottom: 100px; left: 0; right: 0;">
                                <div class="mdl-cell mdl-cell--6-col mdl-cell--bottom">
                                    <h2 class="mdl-card__title-text">${complete_name}</h2>
                                </div>
                                <div class="mdl-cell mdl-cell--6-col mdl-cell--bottom">
                                <i class="mdl-card__description-text">
                                    ${dateToWrite}
                                </i>
                            </div>
                            </div>
                            <img alt="logo" src="${message.author.avatar ? message.author.avatar : '/images/messenger.png'}" style="width: 100%; display: none;" onload="Script.showImageAfterLoad(this.parentElement)" />
                            <div class="mdl-progress mdl-js-progress mdl-progress__indeterminate js-dynamic-background-loader loader-image-${message.discussion}-${date.toISOString().replace(/[:.]/g, '-')}${(index || '')}"></div>
                        </div>
                        <div class="mdl-card__supporting-text">
                            ${message.text.replace(/\n/g, '<br />')}
                        </div>
                        <div class="mdl-card__actions mdl-card--border">
                            <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect mdl-button--icon">
                                <i class="material-icons">exposure_plus_1</i>
                            </button>
                            <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect mdl-button--icon">
                                <i class="material-icons">exposure_neg_1</i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
                return  document.querySelector(`#message-${message.discussion}-${date.toISOString().replace(/[:.]/g, '-')}${(index || '')}`);
            };
            const select_discussion = id => {
                for(let d of document.querySelectorAll(`.discussions .mdl-navigation__link`)) {
                    if(d.hasAttribute('data-id'))
                        if(parseInt(d.getAttribute('data-id')) === parseInt(id))
                            d.classList.add('is-active');
                        else
                            d.classList.remove('is-active');
                }
            };
            const unselect_discussion = id => {
                for(let d of document.querySelectorAll(`.discussions .mdl-navigation__link`)) {
                    if(d.hasAttribute('data-id'))
                        if(parseInt(d.getAttribute('data-id')) === parseInt(id))
                            d.classList.remove('is-active');
                }
            };
            const add_discussion_to_list = discussion => {
                const get_discussion_item = () => {
                    let discussion_a = document.createElement('a');
                    discussion_a.innerHTML = discussion.name;
                    discussion_a.style.cursor = 'pointer';
                    discussion_a.setAttribute('data-id', discussion.id);
                    discussion_a.classList.add('mdl-navigation__link');
                    discussion_a.addEventListener('click', () => {
                        server.emit('get_discussion', {
                            id: server.id,
                            discussion: {
                                id: discussion.id
                            }, user
                        });
                        select_discussion(discussion.id);
                        save_current_discussion(discussion);
                    });
                    return discussion_a;
                };

                for(let d of discussions) {
                    d.appendChild(get_discussion_item());
                }
            };
            const add_user_to_list = _user => {
                const get_user_item = () => {
                    let user_a = document.createElement('a');
                    if(_user.message) {
                        user_a.innerHTML = _user.message;
                    } else {
                        let button = document.createElement('button');
                        button.classList.add('mdl-button', 'mdl-js-button', 'mdl-button--fab', 'mdl-button--mini-fab');
                        let icon = document.createElement('i');
                        icon.classList.add('material-icons');
                        icon.innerText = 'videocam';
                        button.appendChild(icon);
                        button.addEventListener('click', () => {
                            connect(_user.peer_id);

                            this.show_video_call_container = true;
                        });
                        user_a.appendChild(button);

                        let text = document.createElement('span');
                        text.innerText = `${_user.first_name} ${_user.last_name}`;
                        user_a.appendChild(text);
                    }
                    user_a.style.cursor = 'pointer';
                    user_a.setAttribute('data-id', _user.id);
                    user_a.classList.add('mdl-navigation__link');
                    return user_a;
                };

                connected_users.appendChild(get_user_item());
            };
            const load_discussion = discussion => {
                document.querySelector('.discussion-title').innerHTML = discussion.name;
                document.querySelector('.discussion-description').innerHTML = `Bienvenue dans la discussion nommée ${discussion.name}.<br />
                Tous les inscrit peuvent participer à n'importe quelle conversation.`;
                messages.innerHTML = '';
                let last_message = null;
                let index = 0;
                for(let message of discussion.messages) {
                    last_message = add_message_to_list(message, user.id === message.author.id, index);
                    index++;
                }

                if(last_message) {
                    window.location.hash = `#${last_message.getAttribute('id')}`;
                }

                message_form.show();
                select_discussion(discussion.id);
                save_current_discussion(discussion);
            };
            const quit_discussion = () => {
                messages.innerHTML = '';
                document.querySelector('.discussion-title').innerHTML = '';
                localStorage.removeItem('current_discussion');

                message_form.hide();
            };
            const init_discussions = () => {
                fetch('/api/discussions', {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(r => r.json())
                    .then(json => {
                        if(json.success) {
                            for(let d of discussions) {
                                d.innerHTML ='';
                            }
                            for (let d of json.discussions)
                                add_discussion_to_list(d);
                        }

                        get_current_discussion();
                    })
            };
            const message_form = {
                show() {
                    document.querySelector('.discussion-header').style.display = 'initial';
                    document.querySelector('.message-form').style.display = 'initial';
                },
                hide() {
                    document.querySelector('.discussion-header').style.display = 'none';
                    document.querySelector('.message-form').style.display = 'none';
                }
            };

            (function definitionDesEcouteursDEvenementsSockets(script) {
                server.save_client();
                server.save_user(script.peer_id);
                server.on_new_discussion(response => {
                    if(response.created)
                        add_discussion_to_list(response.discussion);
                    Script.initAccordionSizes();
                });
                server.on_new_discussion_broadcast(response => {
                    for(let d of discussions) {
                        d.innerHTML ='';
                    }
                    for(let discussion of response.discussions)
                        add_discussion_to_list(discussion);
                    Script.initAccordionSizes();
                });
                server.on_welcome(response => {
                    let message = add_message_to_list({
                        text: `Vous êtes bien connecté !`,
                        discussion: parseInt(localStorage.getItem('current_discussion')),
                        author: {first_name: 'Serveur'}
                    }, false);
                    window.location.hash = `#${message.getAttribute('id')}`;
                });
                server.on_welcome_broadcast(response => {
                    if(response.discussion.id === parseInt(localStorage.getItem('current_discussion'))) {
                        let message = add_message_to_list({
                            text: `L'utilisateur ${response.user.first_name} s'est connecté !`,
                            discussion: parseInt(localStorage.getItem('current_discussion')),
                            author: {first_name: 'Serveur'}
                        }, false);
                        window.location.hash = `#${message.getAttribute('id')}`;
                    }
                    else
                        script.notification.push('Message du Serveur', {
                            dir: 'ltr',
                            lang: 'fr-FR',
                            body: `L'utilisateur ${response.user.first_name} s'est connecté à la conversation '${response.discussion.name}' !`,
                            icon: '/images/messenger.png'
                        });
                });
                server.on_get_discussion(response => {
                    if(!response.error)
                        load_discussion(response.discussion);
                    Script.initAccordionSizes();
                });
                server.on_new_message(({message}) => {
                    let last_message = add_message_to_list(message, true);
                    window.location.hash = `#${last_message.getAttribute('id')}`;
                });
                server.on_new_message_broadcast(({message, discussion}) => {
                    if(message.discussion === parseInt(localStorage.getItem('current_discussion'))) {
                        let last_message = add_message_to_list(message, false);

                        window.location.hash = `#${last_message.getAttribute('id')}`;
                    }
                    else
                        script.notification.push(`Message de ${message.author.first_name} ${message.author.last_name}`, {
                            dir: 'ltr',
                            lang: 'fr-FR',
                            body: `L'utilisateur ${message.author.first_name} ${message.author.last_name} à laissé un message dans la conversation '${discussion.name}' !`,
                            icon: '/images/messenger.png'
                        });
                });
                server.on_disconnect(quit_discussion);
                server.on_disconnect_broadcast(({discussion, user: {first_name}}) => {
                    if(discussion !== undefined) {
                        if(discussion.id === parseInt(localStorage.getItem('current_discussion'))) {
                            let last_message = add_message_to_list({
                                text: `L'utilisateur ${first_name} s'est déconnecté !`,
                                discussion: parseInt(localStorage.getItem('current_discussion')),
                                author: {first_name: 'Serveur'}
                            }, false);

                            window.location.hash = `#${last_message.getAttribute('id')}`;
                        }
                        else {
                            script.notification.push('Message du Serveur', {
                                dir: 'ltr',
                                lang: 'fr-FR',
                                body: `L'utilisateur ${first_name} s'est déconnecté de la conversation '${discussion.name}' !`,
                                icon: '/images/messenger.png'
                            });
                        }
                    } else {
                        if(localStorage.getItem('current_discussion') === null)
                            script.notification.push('Message du Serveur', {
                                dir: 'ltr',
                                lang: 'fr-FR',
                                body: `L'utilisateur ${first_name} s'est déconnecté !`,
                                icon: '/images/messenger.png'
                            });
                        else {
                            let last_message = add_message_to_list({
                                text: `L'utilisateur ${first_name} s'est déconnecté !`,
                                discussion: parseInt(localStorage.getItem('current_discussion')),
                                author: {first_name: 'Serveur'}
                            }, false);

                            window.location.hash = `#${last_message.getAttribute('id')}`;
                        }
                    }
                });
                server.on_user_write(response => {
                    if(response.user.id !== user.id && response.discussion.id === parseInt(localStorage.getItem('current_discussion')))
                        Socket.add_author(response.user.first_name)
                });
                server.on_user_stop_write(response => {
                    if(response.user.id !== user.id && response.discussion.id === parseInt(localStorage.getItem('current_discussion')))
                        Socket.delete_author(response.user.first_name)
                });
                server.on_get_connected_users(({users}) => {
                    connected_users.innerHTML = '';
                    let _connected_users = [];
                    for(let _user of users)
                        if(_user.id !== user.id) {
                            add_user_to_list(_user);
                            _connected_users.push(_user);
                        }
                    if(_connected_users.length === 0) {
                        add_user_to_list({message: 'Aucun utilisateur connecté'});
                    }
                    Script.initAccordionSizes();
                    console.log(_connected_users);
                });

                server.socket.on('server_log', console.log);
            })(this);

            (function definitionDesClicksSurLesBoutons() {
                send_button.addEventListener('click', () => {
                    server.emit('user_stop_write', {
                        id: server.id,
                        user: user,
                        discussion: {
                            id: parseInt(localStorage.getItem('current_discussion'))
                        }
                    });
                    server.emit('new_message', {
                        id: server.id,
                        discussion: {
                            id: parseInt(localStorage.getItem('current_discussion'))
                        },
                        author: user,
                        message: message.value
                    });
                    message.value = '';
                });
                disconnect_button.addEventListener('click', () => {
                    let current_discussion = parseInt(localStorage.getItem('current_discussion'));
                    unselect_discussion(current_discussion);
                    server.emit('disconnection', {id: server.id, user, discussion: {id: current_discussion}});
                    server.emit('user_stop_write', {id: server.id, user, discussion: {id: current_discussion}});
                });
                add_new_discussion.addEventListener('click', () => {
                    let discussion_name = prompt('Quel est le nom de votre discussion ?');
                    if(discussion_name)
                        server.emit('new_discussion', {id: server.id, discussion: {name: discussion_name}});
                });

                for(let accordion_button of document.querySelectorAll('.mdl-accordion__button')) {
                        accordion_button.addEventListener('click', event => {
                            if(event.target.tagName !== "I" || (event.target.tagName === "I" && event.target.classList.contains('mdl-accordion__icon')))
                                accordion_button.parentNode.classList.toggle('mdl-accordion--opened');
                        });
                    }
            })();

            (function definitionDeLEcouteurDEvenementsPourSavoirQuandQuelquUnEstEnTrainDEcrire() {
                message.addEventListener('keyup', () =>
                    message.value.length > 1
                        ? server.emit('user_write', {id: server.id, user, discussion: {id: parseInt(localStorage.getItem('current_discussion'))}})
                        : server.emit('user_stop_write', {id: server.id, user, discussion: {id: parseInt(localStorage.getItem('current_discussion'))}}));
            })();

            (function definitionDesActionsAuChargementDeLaPage(script) {
                message_form.hide();
                init_discussions();
                Script.initAccordionSizes();
            })(this, server);
        } else window.location.href = '/login';
    }

    login() {
        (function definitionDesSubmitSurLesFormulaires() {
            const connexion_form = document.querySelector('.connexion form');
            connexion_form.addEventListener('submit', e => {
                e.preventDefault();
                let message_connexion = document.querySelector('#message_connexion');
                fetch(connexion_form.getAttribute('action'), {
                    method: connexion_form.getAttribute('method'),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: connexion_form.querySelector('#email_connexion').value,
                        password: connexion_form.querySelector('#password_connexion').value
                    })
                })
                    .then(r => r.json())
                    .then(user =>
                        new Promise((resolve, reject) =>
                            user.error === undefined ? resolve(user) : reject(user.error))
                    ).then(user => {
                        localStorage.setItem('user', JSON.stringify(user));
                        window.location.href = '/';
                    }).catch(err => {
                        message_connexion.style.color = 'red';
                        message_connexion.innerHTML = err
                    });
            });

            const inscription_form = document.querySelector('.inscription form');
            inscription_form.addEventListener('submit', e => {
                e.preventDefault();
                let message_inscription = document.querySelector('#message_inscription');
                fetch(inscription_form.getAttribute('action'), {
                    method: inscription_form.getAttribute('method'),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        first_name: inscription_form.querySelector('#firstname_inscription').value,
                        last_name: inscription_form.querySelector('#lastname_inscription').value,
                        avatar: '',
                        email: inscription_form.querySelector('#email_inscription').value,
                        password: inscription_form.querySelector('#password_inscription').value
                    })
                })
                    .then(r => r.json())
                    .then(user =>
                        new Promise((resolve, reject) =>
                            user.error === undefined ? resolve(user) : reject(user.error)
                        )
                    ).then(() => {
                        message_inscription.style.color = 'green';
                        message_inscription.innerHTML = 'Votre inscription à bien été prise en compte';
                        setTimeout(() => {
                            document.querySelector('a[href="#connexion"]').click();
                            message_inscription.style.color = 'inherit';
                            message_inscription.innerHTML = '';
                        }, 2000);
                    })
                    .catch(err => {
                        message_inscription.style.color = 'red';
                        message_inscription.innerHTML = err;
                    })
            });
        })();

        (function definitionDesActionsAuChargementDeLaPage() {
            localStorage.removeItem('user');
        })();
    }
}
