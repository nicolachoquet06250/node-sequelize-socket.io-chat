const Sequelize = require('sequelize');
const {Discussion} = require("./Discussion");
const {User} = require("./User");
const {sequelize} = require('../../sequelize');
class Message extends Sequelize.Model {}
Message.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: 'compositeIndex'
    },
    text: Sequelize.STRING,
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    author: {
        type: Sequelize.INTEGER,

        references: {
            model: User,
            key: 'id'
        },
        comment: 'reférence à la table user pour lier l\'auteur du message à un utilisateur connu ou non'
    },
    discussion: {
        type: Sequelize.INTEGER,

        references: {
            model: Discussion,
            key: 'id'
        },
        comment: 'reférence à la table discussion pour lier le message à une discussion'
    },
}, {sequelize});
