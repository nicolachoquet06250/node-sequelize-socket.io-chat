class Socket {
    constructor(url, user_name) {
        this.socket = io(url);
        this.user_name = user_name;
    }

    set id(id) {
        document.querySelector('body').setAttribute('data-saved_socket_client_id', id);
    }
    get id() {
        return document.querySelector('body').getAttribute('data-saved_socket_client_id');
    }

    static init_authors() {
        if(Socket.authors === undefined || Socket.authors === null) {
            Socket.authors = new Authors();
        }
    }
    static add_author(author) {
        Socket.init_authors();
        if(Socket.authors.get('authors').indexOf(author) === -1) {
            Socket.authors.set('authors', [...Socket.authors.get('authors'), author]);
        }
    }
    static delete_author(author) {
        Socket.init_authors();
        let tmp = [];
        for(let _author of Socket.authors.get('authors')) {
            if(_author !== author) {
                tmp.push(author);
            }
        }
        Socket.authors.set('authors', [...tmp]);
    }

    is_writing() {
        this.emit('is_writing', {
            id: this.id,
            author: this.user_name
        });
    }
    is_not_writing() {
        this.emit('is_not_writing', {
            id: this.id,
            author: this.user_name
        });
    }

    emit(channel, message) {
        this.socket.emit(channel, message);
    }

    send_message(message) {
        this.emit('chatmsg', {
            id: this.id,
            msg: message,
            author: this.user_name
        });
    }

    save_client() {
        this.socket.on('save_client', ({id}) => {
            this.id = id;
        })
    }
    save_user() {
        let user = localStorage.getItem('user');
        this.emit('save_user', {user});
    }

    on_welcome(callback) {
        this.socket.on('welcome', callback);
    }
    on_welcome_broadcast(callback) {
        this.socket.on('welcome_broadcast', callback);
    }
    on_new_discussion(callback) {
        this.socket.on('new_discussion', callback)
    }
    on_new_discussion_broadcast(callback) {
        this.socket.on('new_discussion_broadcast', callback)
    }
    on_new_message(callback) {
        this.socket.on('new_message', callback)
    }
    on_new_message_broadcast(callback) {
        this.socket.on('new_message_broadcast', callback)
    }
    on_get_discussion(callback) {
        this.socket.on('get_discussion', callback)
    }
    on_disconnect(callback) {
        this.socket.on('disconnection', callback)
    }
    on_disconnect_broadcast(callback) {
        this.socket.on('disconnection_broadcast', callback)
    }
    on_user_write(callback) {
        this.socket.on('user_write', callback)
    }
    on_user_stop_write(callback) {
        this.socket.on('user_stop_write', callback)
    }
    on_get_connected_users(callback) {
        this.socket.on('get_connected_users', callback);
    }
}
