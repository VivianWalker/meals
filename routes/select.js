let express = require('express');
let router = express.Router();
let db = require('../controllers/db');

let show_food = db.show_food();
show_food.then(rows => {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('select', { rows: rows, uid: req.query.uid, name: req.query.name, is_null: req.query.is_null});
  });
});
router.post('/post_order', db.order);
module.exports = router;
