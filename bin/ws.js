const io = require('socket.io');
const {sequelize} = require('../modules/sequelize');
const db = require('../models');

const ws_conf = {
    SERVER: 'Serveur',
    YOU: 'Vous',
    WRITING_CHANNELS: {is: 'user_write', not: 'user_stop_write'},
    WELCOME_CHANNEL: 'user_connected',
    MESSAGE_CHANNEL: 'new_message',
    CHANNEL_NEW_CHANNEL: 'new_discussion',
    NAME_CHANNELS: {request: 'save_name', response: 'name_response'},

    broadcast: (id, channel, message) => {
        for(let client of ws_conf.server.sockets.rooms) {
            if(client.id !== id) {
                client.emit(channel, message);
            }
        }
    },
    emit: (id, channel, message) => {
        let client;
        if((client = ws_conf.get_client(id)) !== undefined) {
            client.emit(channel, message)
        }
    },

    init: http_server => ws_conf.server = io(http_server),
    init_client: client => {
        ws_conf.client = client;
        client.emit('save_client', {id: client.id});
        ws_conf.save_client();
        return ws_conf;
    },
    save_client: () => ws_conf.server.sockets.rooms.push(ws_conf.client),
    save_user: (user, client) => {
        for(let room_id in ws_conf.server.sockets.rooms) {
            if(ws_conf.server.sockets.rooms[room_id].id === client.id) {
                ws_conf.server.sockets.rooms[room_id].user = user;
            }
        }
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

    get_client: id => {
        for(let c of ws_conf.server.sockets.rooms) {
            if(c.id === id) {
                return c;
            }
        }
    },

    say_welcome: (id, discussion, user) => {
        ws_conf.emit(id, 'welcome', {user, discussion});
        ws_conf.broadcast(id, 'welcome_broadcast', {user, discussion})
    },

    on_save_user: callback => ws_conf.client.on('save_user', callback),
    on_new_discussion: callback => ws_conf.client.on('new_discussion', callback),
    on_new_message: callback => ws_conf.client.on('new_message', callback),
    on_get_discussion: callback => ws_conf.client.on('get_discussion', callback),
    on_disconnect: callback => ws_conf.client.on('disconnection', callback),
    on_user_write: callback => ws_conf.client.on('user_write', callback),
    on_user_stop_write: callback => ws_conf.client.on('user_stop_write', callback),

    ws: http_server => {
        ws_conf.init(http_server);
        ws_conf.server.on('connection', client => {
            ws_conf.init_client(client);
            ws_conf.on_save_user(({user}) => ws_conf.save_user(user, ws_conf.client));
            ws_conf.on_new_message(({id, discussion, author, message}) => {
                sequelize.authenticate().then(() => db.Message.create({text: message, author: author.id, discussion: discussion.id}))
                    .then(message => message.JSON)
                    .then(json => {
                        ws_conf.broadcast(id, 'new_message_broadcast', json);
                        ws_conf.emit(id, 'new_message', json);
                    });
            });
            ws_conf.on_new_discussion(({id, discussion}) => {
                sequelize.authenticate().then(() =>
                    db.Discussion.create({name: discussion.name})
                        .then(() => (async function getDiscussionsJSON() {
                            let discussions = await db.Discussion.findAll();
                            let tmp = [];
                            for(let discussion of discussions)
                                tmp.push(await discussion.JSON);
                            return tmp;
                        })())
                        .then(discussions => {
                            ws_conf.broadcast(id, 'new_discussion_broadcast', {discussions});
                            ws_conf.emit(id, 'new_discussion', {
                                created: true,
                                discussion: discussions[discussions.length - 1]
                            });
                        })
                ).catch(err =>
                    ws_conf.emit(id, ws_conf.CHANNEL_NEW_CHANNEL, {
                        created: false,
                        error: err.message
                    }))
            });
            ws_conf.on_get_discussion(({id, discussion, user}) => {
                sequelize.authenticate().then(() => db.Discussion.findOne({where: discussion}))
                    .then(discussion => discussion.JSON)
                    .then(json => {
                        ws_conf.emit(id, 'get_discussion', {
                            discussion: json,
                            error: false
                        });
                        ws_conf.say_welcome(id, discussion, user);
                    })
                    .catch(err => {
                        ws_conf.emit(id, 'get_discussion', {
                            error: true,
                            message: err.message
                        })
                    });
            });
            ws_conf.on_disconnect(response => {
                ws_conf.broadcast(response.id, 'disconnection_broadcast', {user: response.user});
                ws_conf.emit(response.id, 'disconnection', {user: response.user});
            });
            ws_conf.on_user_write(({id, discussion, user}) => {
                ws_conf.broadcast(id, ws_conf.WRITING_CHANNELS.is, {user, discussion});
            });
            ws_conf.on_user_stop_write(({id, discussion, user}) => {
                ws_conf.broadcast(id, ws_conf.WRITING_CHANNELS.not, {user, discussion});
            });
            ws_conf.client.on('disconnect', () => {
                ws_conf.broadcast(ws_conf.client.id, 'disconnection_broadcast', {user: JSON.parse(ws_conf.get_client(client.id).user)});
                ws_conf.unSave_client(client.id);
            });
        });
    }
};

module.exports = {ws: ws_conf};
