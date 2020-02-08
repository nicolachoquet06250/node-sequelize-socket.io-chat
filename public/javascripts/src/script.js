const pages_script = {
    index: () => {
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

            const add_message_to_list = (msg, author, me) => {
                let message_li = document.createElement('li');
                message_li.classList.add(me ? 'right' : 'left');
                message_li.innerHTML = author + ': ' + msg;
                messages.appendChild(message_li);
            };
            const add_discussion_to_list = discussion => {
                let discussion_li = document.createElement('li');
                discussion_li.innerHTML = discussion.name;
                discussion_li.style.cursor = 'pointer';
                discussion_li.addEventListener('click', () => {});
                discussions.appendChild(discussion_li);
            };

            (function definitionDesEcouteursDEvenementsSockets() {
                server.on_catch_message(({msg, author}) => add_message_to_list(msg, author, author === 'Vous'))
                    .on_catch_welcome(({id, msg, author}) => {
                        server.id = id;
                        server.emit('save_name', {id: server.id, name: my_name});
                        add_message_to_list(msg, author, false);
                    })
                    .on_catch_disconnection(({msg, author}) => {
                        function writeMessage() {
                            if (confirm('Voulez vous vraiment vous déconnecter ?')) {
                                document.querySelector('.message-info').innerHTML = '<b>Vous avez été déconnecté</b>';
                                disconnect_button.style.display = 'none';
                                send_button.style.display = 'none';
                                message.setAttribute('disabled', 'disabled');
                            }
                        }

                        author === 'Vous' && msg === true ? writeMessage() : add_message_to_list(msg, author, false)
                    })
                    .on_catch_name_response(({msg, author}) => add_message_to_list(msg, author, false))
                    .on_catch_is_writing(author => Socket.add_author(author))
                    .on_catch_is_not_writing(author => Socket.delete_author(author))
                    .on_catch_new_channel(result => {
                        if(result.created !== undefined) {
                            add_discussion_to_list({name: result.name});
                        } else if (result.discussions !== undefined) {
                            discussions.innerHTML = '';
                            for(let discussion of result.discussions)
                                add_discussion_to_list(discussion);
                        }
                    });
            })();

            (function definitionDesClicksSurLesBoutons() {
                send_button.addEventListener('click', () => {
                    if (message.value !== 'disconnect') {
                        server.is_not_writing();
                        server.send_message(message.value);
                    }
                    message.value = '';
                });
                disconnect_button.addEventListener('click', () => {
                    server.send_message('disconnect');
                    server.is_not_writing();
                    localStorage.removeItem('user');
                    localStorage.clear();
                    window.location.href = '/login';
                });
                add_new_discussion.addEventListener('click', () => {
                    let discussion_name = prompt('Quel est le nom de votre discussion ?');
                    server.emit('new_channel', {id: server.id, name: discussion_name});
                });
            })();

            (function definitionDeLEcouteurDEvenementsPourSavoirQuandQuelquUnEstEnTrainDEcrire() {
                message.addEventListener('keyup', () => message.value.length > 1 ? server.is_writing() : server.is_not_writing());
            })();

            (function definitionDesActionsAuChargementDeLaPage() {
                fetch('/api/discussions', {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(r => r.json())
                    .then(json => {
                        if(json.success)
                            for(let discussion of json.discussions)
                                add_discussion_to_list(discussion)
                    });
            })();
        } else window.location.href = '/login';
    },
    login: () => {
        const tabs = ['inscription', 'connexion'];
        const load_tab = tab_id => {
            if(tabs.indexOf(tab_id.replace('.', '')) !== -1) {
                for(let tab of tabs) {
                    document.querySelector(`.tabs .${tab}`).style.display = 'none';
                    document.querySelector(`.menu .${tab}`).classList.remove('active');
                }
                document.querySelector(`.tabs .${tab_id}`).style.display = 'block';
                document.querySelector(`.menu .${tab_id}`).classList.add('active');
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
                }).then(r => r.json()).then(user => {
                    if(user.error === undefined) {
                        localStorage.setItem('user', JSON.stringify(user));
                        window.location.href = '/';
                    }
                    else throw user.error;
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
                }).then(r => r.json()).then(user => {
                    if(user.error === undefined) load_tab('connexion');
                    else throw user.error;
                }).catch(err => document.querySelector('#message_inscription').innerHTML = err)
            });
        })();

        (function definitionDesClicksSurLesBoutons() {
            document.querySelector('.menu .connexion').addEventListener('click', () => load_tab('connexion'));
            document.querySelector('.menu .inscription').addEventListener('click', () => load_tab('inscription'));
        })();
    }
};
function init_script(page) {
    if(page in pages_script) {
        pages_script[page]();
    }
}
