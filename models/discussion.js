'use strict';
const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Discussion = sequelize.define('Discussion', {
    name: DataTypes.STRING
  }, {engine: 'InnoDB'});
  Discussion.associate = function(models) {};
  return Discussion;
};