let express = require('express');
let router = express.Router();
const {sequelize} = require('../modules/sequelize');

/* GET home page. */
router.get('/', function(req, res, next) {
  sequelize.authenticate().then(() => {
    res.render('index', { title: 'Succès Express' });
  }).catch(err => {
    console.log(err);
    res.render('error', { message: 'Erreur Express', status: err.status, stack: err.stack });
  });
});

module.exports = router;
