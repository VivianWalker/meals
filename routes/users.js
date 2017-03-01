let express = require('express');
let router = express.Router();
let db = require('../controllers/db');

let dpart = db.dpart();
dpart.then(rows => {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('users', { rows: rows, is_register: req.query.is_register, name: req.query.name  });
  });
});
router.post('/post_login', db.login);

module.exports = router;;
