const {sequelize} = require("../../sequelize");
const db = require("../../../models");

sequelize.authenticate()
    .then(() => (async user_id => {
        let user = await db.User.findOne({where: {id: user_id}});
        let userDiscussions = [];
        for(let discussion of await user.MyDiscussions) userDiscussions.push(await discussion.JSON);
        return userDiscussions;
    })(1))
    .then(discussions => console.log('Messages de la discussion `' + discussions[0].name + '`: ', discussions[0].messages));