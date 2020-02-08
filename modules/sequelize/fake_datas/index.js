const {sequelize} = require("../../sequelize");
const db = require("../../../models");

const users = [
    {firstName: 'Nicolas', lastName: 'Choquet', avatar: '', email: 'nchoquet@test.com', password: 'nchoquet'},
    {firstName: 'Yann', lastName: 'Choquet', avatar: '', email: 'ychoquet@test.com', password: 'ychoquet'},
    {firstName: 'André', lastName: 'Choquet', avatar: '', email: 'achoquet@test.com', password: 'achoquet'},
    {firstName: 'Grégory', lastName: 'Choquet', avatar: '', email: 'gchoquet@test.com', password: 'gchoquet'}
];

const discussions = [{name: 'Everybody'}];

const messages = [
    {text: 'hello c\'est %name%', author: 1, discussion: 1},
    {text: 'hello c\'est %name%', author: 2, discussion: 1},
    {text: 'hello c\'est %name%', author: 3, discussion: 1},
    {text: 'hello c\'est %name%', author: 4, discussion: 1}
];

sequelize.authenticate().then(() => {
    console.log('success !!');
    for(let user of users)
        db.User.create({first_name: user.firstName, last_name: user.lastName, avatar: user.avatar})
            .then(user => console.log(`L'utilisateur '${user.first_name} ${user.last_name}' à été créé !!`));

    for(let discussion of discussions)
        db.Discussion.create({name: discussion.name})
            .then(discussion => console.log(`La discussion '${discussion.name}' à été créé !!`));

    for(let message of messages)
        db.User.findOne({where: {id: message.author}}).then(user =>
            db.Message.create({
                text: message.text.replace('%name%', user.first_name),
                author: message.author,
                discussion: message.discussion
            }).then(message =>
                console.log(`Le message '${message.text}' à été créé dans la discussion '${message.Discussion.name}'`)
            )
        );
}).catch(err => console.log(err));
