'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
    // virtual properties
    MyDiscussions: {
      type: DataTypes.VIRTUAL,
      async get() {
        const db = require('../models');
        let discussions = await db.Discussion.findAll();
        let myDiscussions = [];
        for(let discussion of discussions) {
          let messages = await discussion.Messages;
          let myMessagesForThisDiscussion = [];
          if(messages.length > 0) {
            for(let message of messages) {
              const author = await message.Author;
              if (author.id === this.id) myMessagesForThisDiscussion.push(message);
            }
          }
          if(myMessagesForThisDiscussion.length > 0) myDiscussions.push(discussion);
        }
        return myDiscussions;
      },
      set(discussions) {
        const db = require('../models');
      }
    },
    JSON: {
      type: DataTypes.VIRTUAL,
      async get() {
        return {
          id: this.id,
          first_name: this.first_name,
          last_name: this.last_name,
          avatar: this.avatar,
          email: this.email,
          my_discussions: (await this.MyDiscussions).map(d => d.id),
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        }
      }
    }
  }, {engine: 'InnoDB'});
  User.associate = function(models) {};
  return User;
};