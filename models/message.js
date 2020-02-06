'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    text: DataTypes.STRING,
    author: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    discussion: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Discussions',
        key: 'id'
      }
    },
    // virtual properties
    Author: {
      type: DataTypes.VIRTUAL,
      async get() {
        const db = require('../models');
        if(this.author !== undefined && this.author !== 0 && this.author !== null) {
          return await db.User.findOne({where: {id: this.author}});
        }
        return new Promise(resolve => resolve(null));
      },
      set(author) {
        if(author !== undefined && author !== null && typeof author === 'object') {
          this.author = author.id;
        }
      }
    },
    Discussion: {
      type: DataTypes.VIRTUAL,
      get() {
        const db = require('../models');
        if(this.discussion !== undefined && this.discussion !== 0 && this.discussion !== null) {
          return db.Discussion.findOne({where: {id: this.discussion}});
        }
        return null;
      },
      set(discussion) {
        if(discussion !== undefined && discussion !== null && typeof discussion === 'object') {
          this.discussion = discussion.id;
        }
      }
    },
    JSON: {
      type: DataTypes.VIRTUAL,
      async get() {
        return {
          id: this.id,
          author: await (await this.Author).JSON,
          discussion: this.discussion,
          text: this.text,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        };
      }
    }
  }, {engine: 'InnoDB'});
  Message.associate = function(models) {};
  return Message;
};