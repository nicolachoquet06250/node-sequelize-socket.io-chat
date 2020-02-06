'use strict';
module.exports = (sequelize, DataTypes) => {
  const Discussion = sequelize.define('Discussion', {
    name: DataTypes.STRING,
    // virtual properties
    Messages: {
      type: DataTypes.VIRTUAL,
      async get() {
        const db = require('../models');
        let messages = await db.Message.findAll({where: {discussion: this.id}});
        return messages;
      },
      set(messages) {
        const db = require('../models');
        const _messages = this.Messages;
        let messageToAdd = null;
        for(let _message of _messages) {
          for(let message of messages) {
            if(message.id !== _message.id) {
              messageToAdd = message;
            }
          }
        }
        if(messageToAdd !== null) {
          db.Message.create(messageToAdd).then(() => {});
        }
      }
    },
    JSON: {
      type: DataTypes.VIRTUAL,
      async get() {
        let messages = await this.Messages;
        let messages_JSON = [];
        for(let m of messages) {
          messages_JSON.push(await m.JSON);
        }
        return {
          id: this.id,
          name: this.name,
          messages: messages_JSON,
          createAt: this.createdAt,
          updatedAt: this.updatedAt
        };
      }
    }
  }, {engine: 'InnoDB'});
  Discussion.associate = function(models) {};
  return Discussion;
};