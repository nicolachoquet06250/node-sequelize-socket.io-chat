const Sequelize = require('sequelize');

const credentials = {
    dialect: 'mysql',
    username: 'nchoquet',
    password: 'nchoquet',
    hostname: 'localhost',
    port: 3307,
    database: 'sequelize'
};

const sequelize = new Sequelize(`${credentials.dialect}://${credentials.username}:${credentials.password}@${credentials.hostname}:${credentials.port}/${credentials.database}`);

module.exports = {sequelize};