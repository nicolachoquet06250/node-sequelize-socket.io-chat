const {sequelize} = require("../../sequelize");
const db = require("../../../models");

sequelize.authenticate().then(() => {
    db.User.findAll().then(users => {
        // for(let user of users) {
            // db.Message.create({author: user.id, discussion: 1, text: `coucou c'est ${user.first_name}`}).then(message => {
            //     console.log(`le message '${message.text}' à été écrit par '${message.author.first_name} ${message.author.last_name}'`);
            // });
            // console.log(user.id + ' - ' + user.first_name + ' ' + user.last_name);
        // }

        db.Message.findOne({where: {id: 3}}).then(message => {
            console.log(message.text);
            message.Author.then(author => {
                console.log(author.first_name + ' ' + author.last_name);
            });

            message.Discussion.then(discussion => {
                console.log(discussion.name);
            });
        });
    });
});