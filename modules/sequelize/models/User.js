const Sequelize = require('sequelize');
const {sequelize} = require('../../sequelize');
class User extends Sequelize.Model {}
User.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: 'compositeIndex'
    },
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    avatar: Sequelize.STRING,
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
}, {sequelize});

module.exports = {User};
