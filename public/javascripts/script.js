const pages_script = {
    index: () => {
        const my_name = prompt('Quel est ton nom ?');
        var server = new Socket('ws://localhost:3001/', my_name);

        let messages = document.querySelector('.messages');
        let message = document.querySelector('.message');
        let send_button = document.querySelector('.send');
        let disconnect_button = document.querySelector('.disconnect');

        const add_message_to_list = (msg, author, me) => {
            let message_li = document.createElement('li');
            message_li.classList.add(me ? 'right' : 'left');
            message_li.innerHTML = author + ': ' + msg;
            messages.append(message_li);
        };

        server.on_catch_message(({msg, author}) => add_message_to_list(msg, author, author === 'Vous'));

        server.on_catch_welcome(({id, msg, author}) => {
            server.id = id;
            server.emit('save_name', {id: server.id, name: my_name});
            add_message_to_list(msg, author, false);
        });

        server.on_catch_disconnection(({msg, author}) => {
            function writeMessage() {
                if(confirm('Voulez vous vraiment vous déconnecter ?')) {
                    document.querySelector('.message-info').innerHTML = '<b>Vous avez été déconnecté</b>';
                    disconnect_button.style.display = 'none';
                    send_button.style.display = 'none';
                    message.setAttribute('disabled', 'disabled');
                }
            }
            author === 'Vous' && msg === true ? writeMessage() : add_message_to_list(msg, author, false)
        });

        server.on_catch_name_response(({msg, author}) => add_message_to_list(msg, author, false));

        server.on_catch_is_writing(author => Socket.add_author(author));

        server.on_catch_is_not_writing(author => Socket.delete_author(author));

        send_button.addEventListener('click', () => {
            if(message.value !== 'disconnect') {
                server.is_not_writing();
                server.send_message(message.value);
            }
            message.value = '';
        });

        disconnect_button.addEventListener('click', () => {
            server.send_message('disconnect');
            server.is_not_writing();
        });

        message.addEventListener('keyup', () => message.value.length > 1 ? server.is_writing() : server.is_not_writing());
    },
    login: () => {
        const tabs = [
            'inscription',
            'connexion',
        ];
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
            }).then(r => r.json())
                .then(json => {
                    console.log(json);
                })
        });

        document.querySelector('.menu .connexion').addEventListener('click', () => load_tab('connexion'));
        document.querySelector('.menu .inscription').addEventListener('click', () => load_tab('inscription'));
    }
};
function init_script(page) {
    if(page in pages_script) {
        pages_script[page]();
    }
}