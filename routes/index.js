let express = require('express');
let router = express.Router();
const {sequelize} = require('../modules/sequelize');
const db = require('../models');

// PAGES
router.get('/', (req, res) => {
  sequelize.authenticate().then(() => {
    res.render('index', { title: 'Messenger' });
  }).catch(err => {
    console.log(err);
    res.render('error', { message: 'Erreur Express', status: err.status, stack: err.stack });
  });
});

router.get('/login', (req, res) => {
  res.render('login', {title: 'Messenger'});
});

// API
router.post('/api/login', (req, res) => {
  sequelize.authenticate().then(() => (async (email, password) => await db.User.findOne({where: {email, password}}))(req.body.email, req.body.password))
      .then(async user => res.json(await user.JSON))
      .catch(err => res.json({error: err.message}));
});

router.post('/api/register', (req, res) => {
  sequelize.authenticate().then(() => (async (email, password) => await db.User.findOne({where: {email, password}}))(req.body.email, req.body.password))
      .then(user => (async (first_name, last_name, email, password, avatar) => {
        if(user) {
          throw {message: 'Un compte existe déjà avec ces identifiants.'}
        } else {
          return await db.User.create({first_name, last_name, email, password, avatar})
        }
      })(
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
    for(let discussion of discussions)
      _discussions.push(await discussion.JSON);
    return _discussions;
  })()).then(json => res.json({discussions: json, success: true}))
      .catch(err => {
        console.log(err);
        res.json({success: false})
      });
});

router.get('/api/discussion/:discussion_id', (req, res) => {
  sequelize.authenticate().then(() => (async () => {
    let discussion = await db.Discussion.findOne({where: {id: parseInt(req.param('discussion_id'))}});
    return await discussion.JSON;
  })()).then(json => res.json({discussion: json}))
});

module.exports = router;
