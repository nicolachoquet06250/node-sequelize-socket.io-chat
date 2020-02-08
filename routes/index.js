let express = require('express');
let router = express.Router();
const {sequelize} = require('../modules/sequelize');
const db = require('../models');

// PAGES
router.get('/', (req, res) => {
  sequelize.authenticate().then(() => {
    res.render('index', { title: 'Succès Express' });
  }).catch(err => {
    console.log(err);
    res.render('error', { message: 'Erreur Express', status: err.status, stack: err.stack });
  });
});

router.get('/login', (req, res) => {
  res.render('login', {defaultSelected: 'connexion'});
});

// API
router.post('/api/login', (req, res) => {
  sequelize.authenticate().then(() => (async (email, password) => await db.User.findOne({where: {email, password}}))(req.body.email, req.body.password))
      .then(async user => res.json(await user.JSON))
      .catch(err => res.json({error: err.message}));
});

router.post('/api/register', (req, res) => {
  sequelize.authenticate().then(() => (async (first_name, last_name, email, password, avatar) =>
      await db.User.create({first_name, last_name, email, password, avatar}))(
          req.body.first_name,
          req.body.last_name,
          req.body.email,
          req.body.password,
          req.body.avatar
      ))
      .then(async user => res.json(await user.JSON))
      .catch(err => res.json({error: err.message}));
});

router.get('/api/discussions', (req, res) => {
  sequelize.authenticate().then(() => (async () => {
    let discussions = await db.Discussion.findAll();
    let _discussions = [];
    for(let discussion of discussions) {
      _discussions.push(await discussion.JSON);
    }
    return _discussions;
  })()).then(json => res.json({discussions: json, success: true}))
      .catch(err => {
        console.log(err)
        res.json({success: false})
      });
});

module.exports = router;
