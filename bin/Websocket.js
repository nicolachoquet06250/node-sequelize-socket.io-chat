module.exports = class Websocket {
    get socket() {
        return this._socket;
    }
    set socket(http_server) {
        this._socket = require('socket.io')(http_server)
    }

    get client() {
        return this._client;
    }
    set client(client) {
        this._client = client;
        this.client.emit('save_client', {id: client.id});
        this.socket.sockets.rooms.push(this.client);
    }
    get_client(id) {
        for(let c of this.socket.sockets.rooms) {
            if(c.id === id) {
                return c;
            }
        }
    }

    set user(user) {
        for(let room_id in this.socket.sockets.rooms) {
            console.log(this.socket.sockets.rooms[room_id].id, this.client.id);
            if(this.socket.sockets.rooms[room_id].id === this.client.id) {
                this.socket.sockets.rooms[room_id].user = user;
            }
        }
    }

    get sequelize() {
        if(this._sequelize === null || this._sequelize === undefined) {
            this._sequelize = require('../modules/sequelize').sequelize;
        }
        return this._sequelize;
    }

    get database() {
        if(this._db === null || this._db === undefined) {
            this._db = require('../models');
        }
        return this._db;
    }

    broadcast(id, channel, message) {
        for(let client of this.socket.sockets.rooms) {
            if(client.id !== id) {
                client.emit(channel, message);
            }
        }
    }
    emit(id, channel, message) {
        let client;
        if((client = this.get_client(id)) !== undefined) {
            client.emit(channel, message)
        }
    }
    un_save_client(id) {
        for(let i in this.socket.sockets.rooms) {
            if(this.socket.sockets.rooms[i].id === id) {
                delete this.socket.sockets.rooms[i];
            }
        }
        let tmp = [];
        for(let i in this.socket.sockets.rooms) {
            if(this.socket.sockets.rooms[i] !== null && this.socket.sockets.rooms[i] !== undefined) {
                tmp.push(this.socket.sockets.rooms[i]);
            }
        }
        this.socket.sockets.rooms = tmp;
    }

    say_welcome(id, discussion, user) {
        this.sequelize.authenticate().then(() => this.database.Discussion.findOne({where: {id: discussion.id}}))
            .then(d => d.JSON)
            .then(discussion => {
                this.emit(id, 'welcome', {user, discussion});
                this.broadcast(id, 'welcome_broadcast', {user, discussion});
            });
    }

    on_save_user(callback) {
        this.client.on('save_user', callback)
    }
    on_new_discussion(callback) {
        this.client.on('new_discussion', callback)
    }
    on_new_message(callback) {
        this.client.on('new_message', callback)
    }
    on_get_discussion(callback) {
        this.client.on('get_discussion', callback)
    }
    on_disconnect(callback) {
        this.client.on('disconnection', callback)
    }
    on_user_write(callback) {
        this.client.on('user_write', callback)
    }
    on_user_stop_write(callback) {
        this.client.on('user_stop_write', callback)
    }

    constructor(http_server) {
        this.socket = http_server;

        this.socket.on('connection', client => {
            this.client = client;
            this.on_save_user(({user}) => this.user = user);
            this.on_new_message(({id, discussion, author, message}) => {
                this.sequelize.authenticate().then(() => this.database.Message.create({text: message, author: author.id, discussion: discussion.id}))
                    .then(message => message.JSON)
                    .then(json => {
                        this.database.Discussion.findOne({where: {id: discussion.id}}).then(_discussion => {
                            this.broadcast(id, 'new_message_broadcast', {message: json, discussion: _discussion});
                            this.emit(id, 'new_message', {message: json, discussion: _discussion});
                        });
                    });
            });
            this.on_new_discussion(({id, discussion}) => {
                this.sequelize.authenticate().then(() => {
                    let database = this.database;
                    let current_ws = this;
                    database.Discussion.create({name: discussion.name})
                        .then(() => (async function getDiscussionsJSON() {
                            let discussions = await database.Discussion.findAll();
                            let tmp = [];
                            for (let discussion of discussions)
                                tmp.push(await discussion.JSON);
                            return tmp;
                        })())
                        .then(discussions => {
                            current_ws.broadcast(id, 'new_discussion_broadcast', {discussions});
                            current_ws.emit(id, 'new_discussion', {
                                created: true,
                                discussion: discussions[discussions.length - 1]
                            });
                        })
                    }
                ).catch(err =>
                    this.emit(id, 'new_discussion', {
                        created: false,
                        error: err.message
                    }))
            });
            this.on_get_discussion(({id, discussion, user}) => {
                this.sequelize.authenticate().then(() => this.database.Discussion.findOne({where: discussion}))
                    .then(discussion => discussion.JSON)
                    .then(json => {
                        this.emit(id, 'get_discussion', {
                            discussion: json,
                            error: false
                        });
                        this.say_welcome(id, discussion, user);
                    })
                    .catch(err => {
                        this.emit(id, 'get_discussion', {
                            error: true,
                            message: err.message
                        })
                    });
            });
            this.on_disconnect(response => {
                this.sequelize.authenticate().then(() => this.database.Discussion.findOne({where: {id: response.discussion.id}}))
                    .then(discussion => discussion.JSON)
                    .then(json => {
                        this.broadcast(response.id, 'disconnection_broadcast', {user: response.user, discussion: json});
                        this.emit(response.id, 'disconnection', {user: response.user, discussion: json});
                    });
            });
            this.on_user_write(({id, discussion, user}) => {
                this.broadcast(id, 'user_write', {user, discussion});
            });
            this.on_user_stop_write(({id, discussion, user}) => {
                this.broadcast(id, 'user_stop_write', {user, discussion});
            });
            this.client.on('disconnect', () => {
                console.log('disconnection_broadcast', client.id, this.get_client(client.id).user);
                this.broadcast(client.id, 'disconnection_broadcast', {
                    user: JSON.parse(this.get_client(client.id).user)
                });
                this.un_save_client(client.id);
            });
        });
    }
};
