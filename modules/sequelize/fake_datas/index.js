const {sequelize} = require("../../sequelize");
const db = require("../../../models");

const users = [
    {firstName: 'Nicolas', lastName: 'Choquet', avatar: ''},
    {firstName: 'Yann', lastName: 'Choquet', avatar: ''},
    {firstName: 'André', lastName: 'Choquet', avatar: ''},
    {firstName: 'Grégory', lastName: 'Choquet', avatar: ''}
];

sequelize.authenticate().then(() => {
    console.log('success !!');
    for(let user of users)
        db.User.create({first_name: user.firstName, last_name: user.lastName, avatar: user.avatar})
            .then(user => console.log(`L'utilisateur '${user.first_name} ${user.last_name}' à été créé !!`));

    db.Discussion.create({name: 'Everybody'}).then(discussion => console.log(`La discussion '${discussion.name}' à été créée !!`));
}).catch(err => console.log(err));
