
require('dotenv').config({path: __dirname + '/../.env'});

let node_env = process.env.NODE_ENV || 'development';
let username = process.env.DB_USERNAME || 'nchoquet';
let password = process.env.DB_PASSWORD || 'nchoquet';
let port = process.env.DB_PORT || 3306;
let dialect = process.env.DB_DIALECT || 'mysql';
let database = process.env.DB_DATABASE || 'sequelize';
let host = process.env.DB_HOST || '127.0.0.1';

module.exports = {
    [node_env]: {username, password, database, host, port, dialect}
};