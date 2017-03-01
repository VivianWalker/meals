let express = require('express');
let router = express.Router();
let db = require('../controllers/db');

let dpart = db.dpart();
dpart.then(rows => {
  router.get('/', function (req, res, next) {
    res.render('register', { rows: rows, error: req.query.error});
  });
});
router.post('/post_register', db.register);

module.exports = router;