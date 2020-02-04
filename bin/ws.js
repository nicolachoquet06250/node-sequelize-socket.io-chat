const io = require('socket.io');

const SERVER = 'Serveur';
const YOU = 'Vous';

const WRITING_CHANNELS = {
    is: 'is_writing',
    not: 'is_not_writing'
};
const WELCOME_CHANNEL = 'welcome';
const MESSAGE_CHANNEL = 'chatmsg';
const NAME_CHANNELS = {
    request: 'save_name',
    response: 'name_response'
};

const ws_conf = {
    init: http_server => ws_conf.server = io(http_server),
    init_client: client => {
        ws_conf.client = client;
        ws_conf.save_client();
        return ws_conf;
    },
    save_client: () => {
        ws_conf.server.sockets.rooms.push(ws_conf.client);
    },
    unSave_client: id => {
        for(let i in ws_conf.server.sockets.rooms) {
            if(ws_conf.server.sockets.rooms[i].id === id) {
                delete ws_conf.server.sockets.rooms[i];
            }
        }
        let tmp = [];
        for(let i in ws_conf.server.sockets.rooms) {
            if(ws_conf.server.sockets.rooms[i] !== null && ws_conf.server.sockets.rooms[i] !== undefined) {
                tmp.push(ws_conf.server.sockets.rooms[i]);
            }
        }
        ws_conf.server.sockets.rooms = tmp;
    },
    say_welcome: () => {
        ws_conf.client.emit(WELCOME_CHANNEL, {id: ws_conf.client.id, msg: 'Bienvenue sur le tchat', author: SERVER});
        return ws_conf;
    },
    get_client: id => {
        for(let c of ws_conf.server.sockets.rooms) {
            if(c.id === id) {
                return c;
            }
        }
    },
    broadcast: (id, channel, message) => {
        for(let client of ws_conf.server.sockets.rooms) {
            if(client.id !== id) {
                client.emit(channel, message);
            }
        }
    },
    emit: (id, channel, message) => ws_conf.get_client(id).emit(channel, message),
    send_message: ({id, msg, author}) => ws_conf.emit(id, MESSAGE_CHANNEL, {msg, author}),
    send_name_response_on_broadcast: (id, msg) => ws_conf.broadcast(id, NAME_CHANNELS.response, {msg, author: SERVER}),
    send_message_on_broadcast: ({id, msg, author}) => ws_conf.broadcast(id, MESSAGE_CHANNEL, {msg, author}),
    on_catch_message: callback => ws_conf.client.on(MESSAGE_CHANNEL, callback),
    on_catch_user: callback => ws_conf.client.on(NAME_CHANNELS.request, callback),
    on_catch_is_writing: callback => ws_conf.client.on(WRITING_CHANNELS.is, callback),
    on_catch_is_not_writing: callback => ws_conf.client.on(WRITING_CHANNELS.not, callback),

    ws: http_server => {
        ws_conf.init(http_server);
        ws_conf.server.on('connection', client => {
            ws_conf.init_client(client).say_welcome();
            ws_conf.on_catch_user(({id, name}) => ws_conf.send_name_response_on_broadcast(id, `${name} s'est connecté !`));
            ws_conf.on_catch_is_writing(({id, author}) => ws_conf.broadcast(id, WRITING_CHANNELS.is, author));
            ws_conf.on_catch_is_not_writing(({id, author}) => ws_conf.broadcast(id, WRITING_CHANNELS.not, author));
            ws_conf.on_catch_message( ({id, msg, author}) => {
                if(msg === 'disconnect') {
                    ws_conf.broadcast(id, 'disconnection', {msg: `${author} s'est deconnecté`, author: SERVER});
                    ws_conf.emit(id, 'disconnection', {msg: true, author: YOU});
                    ws_conf.unSave_client(id);
                } else {
                    ws_conf.send_message_on_broadcast({id, msg, author});
                    ws_conf.send_message({id, msg, author: YOU});
                }
            });
        });
    }
};

module.exports = {ws: ws_conf};