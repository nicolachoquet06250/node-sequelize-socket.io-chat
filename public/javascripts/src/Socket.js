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

    on_catch_welcome(callback) {
        this.socket.on('welcome', callback);
        return this;
    }
    on_catch_message(callback) {
        this.socket.on('chatmsg', callback);
        return this;
    }
    on_catch_disconnection(callback) {
        this.socket.on('disconnection', callback);
        return this;
    }
    on_catch_name_response(callback) {
        this.socket.on('name_response', callback);
        return this;
    }
    on_catch_is_writing(callback) {
        this.socket.on('is_writing', callback);
        return this;
    }
    on_catch_is_not_writing(callback) {
        this.socket.on('is_not_writing', callback);
        return this;
    }
}