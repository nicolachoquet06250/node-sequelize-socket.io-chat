'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    avatar: DataTypes.STRING
  }, {engine: 'InnoDB'});
  User.associate = function(models) {};
  return User;
};