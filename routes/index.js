let express = require('express');
let router = express.Router();
const {sequelize} = require('../modules/sequelize');
const db = require('../models');

/* GET home page. */
router.get('/', function(req, res) {
  sequelize.authenticate().then(() => {
    res.render('index', { title: 'Succès Express' });
  }).catch(err => {
    console.log(err);
    res.render('error', { message: 'Erreur Express', status: err.status, stack: err.stack });
  });
});

router.post('/api/login', function (req, res) {
  sequelize.authenticate().then(() => (async (email, password) => {
    let user = await db.User.findOne({where: {email, password}});
    return user;
  })((body => JSON.parse(body).email)(req.body), (body => JSON.parse(body).password)(req.body)))
      .then(async user => res.json(await user.JSON))
      .catch(err => res.render('error', {message: 'Erreur Express', status: err.status}));
});

router.post('/api/register', function (req, res) {
  sequelize.authenticate().then(() => (async (first_name, last_name, email, password, avatar) => {
    let user = await db.User.create({first_name, last_name, email, password, avatar});
    return await user;
  })((body => JSON.parse(body).first_name)(req.body), (body => JSON.parse(body).last_name)(req.body), (body => JSON.parse(body).email)(req.body), (body => JSON.parse(body).password)(req.body), (body => JSON.parse(body).avatar)(req.body)))
      .then(async user => res.json(await user.JSON))
      .catch(err => res.json({error: err}));
});

module.exports = router;
