const Sequelize = require('sequelize');
const {sequelize} = require('../../sequelize');
const Model = Sequelize.Model;
class Discussion extends Model {}
Discussion.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    author: {
        type: Sequelize.STRING
    },
    message: {
        type: Sequelize.STRING
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: 'NOW()'
    }
}, {
    sequelize,
    modelName: 'discussion'
});