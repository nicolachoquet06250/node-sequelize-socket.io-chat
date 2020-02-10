class Script {
    constructor(page) {
        if(page in this)
            this[page]();
    }

    index() {
        let user = localStorage.getItem('user');
        if(user !== undefined && user !== null) {
            user = JSON.parse(user);
            const my_name = user.first_name;
            var server = new Socket('ws://localhost:3001/', my_name);

            let messages = document.querySelector('.messages');
            let discussions = document.querySelector('.discussions');
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
            const add_message_to_list = (msg, author, me) => {
                let message_li = document.createElement('li');
                message_li.classList.add(me ? 'right' : 'left');
                message_li.innerHTML = (me ? 'Moi' : author.first_name) + ': ' + msg;
                messages.appendChild(message_li);
            };
            const add_discussion_to_list = discussion => {
                let discussion_li = document.createElement('li');
                discussion_li.innerHTML = discussion.name;
                discussion_li.style.cursor = 'pointer';
                discussion_li.addEventListener('click', () => {
                    server.emit('get_discussion', {
                        id: server.id,
                        discussion: {
                            id: discussion.id
                        }, user
                    });
                    save_current_discussion(discussion);
                });
                discussions.appendChild(discussion_li);
            };
            const load_discussion = discussion => {
                document.querySelector('.discussion-title').innerHTML = `Messages de '${discussion.name}'`;
                messages.innerHTML = '';
                for(let message of discussion.messages)
                    add_message_to_list(message.text, message.author, user.id === message.author.id);

                save_current_discussion(discussion);
            };
            const quit_discussion = () => {
                messages.innerHTML = '';
                document.querySelector('.discussion-title').innerHTML = '';
                localStorage.removeItem('current_discussion');
            };
            const init_discussions = () => {
                fetch('/api/discussions', {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(r => r.json())
                    .then(json => {
                        if(json.success)
                            for(let discussion of json.discussions)
                                add_discussion_to_list(discussion);

                        get_current_discussion();
                    })
            };

            (function definitionDesEcouteursDEvenementsSockets() {
                    server.save_client();
                    server.save_user();
                    server.on_new_discussion(response => {
                        if(response.created)
                            add_discussion_to_list(response.discussion);
                    });
                    server.on_new_discussion_broadcast(response => {
                        discussions.innerHTML = '';
                        for(let discussion of response.discussions)
                            add_discussion_to_list(discussion);
                    });
                    server.on_welcome(response => {
                        add_message_to_list(`Vous êtes bien connecté !`, {first_name: 'Serveur'}, false)
                    });
                    server.on_welcome_broadcast(response => {
                        if(response.discussion.id === parseInt(localStorage.getItem('current_discussion')))
                            add_message_to_list(`L'utilisateur ${response.user.first_name} s'est connecté !`, {first_name: 'Serveur'}, false)
                    });
                    server.on_get_discussion(response => {
                        if(!response.error)
                            load_discussion(response.discussion);
                    });
                    server.on_new_message(message => {
                        if(message.discussion === parseInt(localStorage.getItem('current_discussion')))
                            add_message_to_list(message.text, message.author, true)
                    });
                    server.on_new_message_broadcast(message => {
                        if(message.discussion === parseInt(localStorage.getItem('current_discussion')))
                            add_message_to_list(message.text, message.author, false);
                    });
                    server.on_disconnect(quit_discussion);
                    server.on_disconnect_broadcast(response => {
                        add_message_to_list(`L'utilisateur ${response.user.first_name} s'est déconnecté !`, {first_name: 'Serveur'}, false)
                    });
                    server.on_user_write(response => {
                        if(response.user.id !== user.id && response.discussion.id === parseInt(localStorage.getItem('current_discussion')))
                            Socket.add_author(response.user.first_name)
                    });
                    server.on_user_stop_write(response => {
                        if(response.user.id !== user.id && response.discussion.id === parseInt(localStorage.getItem('current_discussion')))
                            Socket.delete_author(response.user.first_name)
                    });
                })();

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
                        server.emit('disconnection', {id: server.id, user, discussion: {id: parseInt(localStorage.getItem('current_discussion'))}});
                        server.emit('user_stop_write', {id: server.id, user, discussion: {id: parseInt(localStorage.getItem('current_discussion'))}});
                    });
                    add_new_discussion.addEventListener('click', () => {
                        let discussion_name = prompt('Quel est le nom de votre discussion ?');
                        if(discussion_name !== '')
                            server.emit('new_discussion', {id: server.id, discussion: {name: discussion_name}});
                    });
                })();

            (function definitionDeLEcouteurDEvenementsPourSavoirQuandQuelquUnEstEnTrainDEcrire() {
                    message.addEventListener('keyup', () =>
                        message.value.length > 1
                            ? server.emit('user_write', {id: server.id, user, discussion: {id: parseInt(localStorage.getItem('current_discussion'))}})
                            : server.emit('user_stop_write', {id: server.id, user, discussion: {id: parseInt(localStorage.getItem('current_discussion'))}}));
                })();

            (function definitionDesActionsAuChargementDeLaPage() {
                init_discussions();
            })();
        } else window.location.href = '/login';
    }

    login() {
        const tabs = ['inscription', 'connexion'];
        const load_tab = tab_id => {
            function unselect_complete_tab(tab) {
                document.querySelector(`.tabs .${tab}`).style.display = 'none';
                document.querySelector(`.menu .${tab}`).classList.remove('active');
            }
            function select_complete_tab(tab) {
                document.querySelector(`.tabs .${tab}`).style.display = 'block';
                document.querySelector(`.menu .${tab}`).classList.add('active');
            }

            if(tabs.indexOf(tab_id.replace('.', '')) !== -1) {
                for(let tab of tabs)
                    unselect_complete_tab(tab);
                select_complete_tab(tab_id);
            }
        };

        load_tab('connexion');

        (function definitionDesSubmitSurLesFormulaires() {
            const connexion_form = document.querySelector('.tabs .connexion form');
            connexion_form.addEventListener('submit', e => {
                e.preventDefault();
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
                }).catch(err => document.querySelector('#message_connexion').innerHTML = err);
            });

            const inscription_form = document.querySelector('.tabs .inscription form');
            inscription_form.addEventListener('submit', e => {
                e.preventDefault();
                fetch(inscription_form.getAttribute('action'), {
                    method: inscription_form.getAttribute('method'),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        first_name: inscription_form.querySelector('#firstname_connexion').value,
                        last_name: inscription_form.querySelector('#lastname_connexion').value,
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
                    )
                    .then(() => load_tab('connexion'))
                    .catch(err => document.querySelector('#message_inscription').innerHTML = err)
            });
        })();

        (function definitionDesClicksSurLesBoutons() {
            document.querySelector('.menu .connexion').addEventListener('click', () => load_tab('connexion'));
            document.querySelector('.menu .inscription').addEventListener('click', () => load_tab('inscription'));
        })();
    }
}