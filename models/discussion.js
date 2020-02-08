'use strict';
module.exports = (sequelize, DataTypes) => {
  const Discussion = sequelize.define('Discussion', {
    name: DataTypes.STRING,
    // virtual properties
    Messages: {
      type: DataTypes.VIRTUAL,
      async get() {
        return await (require('../models').Message.findAll({where: {discussion: this.id}}));
      },
      set(messages) {
        this.Messages.then(_messages => {
          let messageToAdd = null;
          if(_messages.length > 0)
            for(let _message of _messages)
              for(let message of messages)
                if(message.id !== _message.id)
                  messageToAdd = message;
          else
            messageToAdd = messages[0];
          if(messageToAdd !== null)
            require('../models').Message.create(messageToAdd).then(createdMessage =>
                console.log(`Le message avec l'id ${createdMessage.id} à été créé !`));
        });
      }
    },
    JSON: {
      type: DataTypes.VIRTUAL,
      async get() {
        let messages = await this.Messages;
        let messages_JSON = [];
        for(let m of messages) messages_JSON.push(await m.JSON);
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
