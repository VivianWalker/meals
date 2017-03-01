let express = require('express');
let router = express.Router()
let db = require('../controllers/db');

router.get('/', function (req, res, next) {
    let show_order = db.show_order();
    show_order.then((rows) => {
        res.render('order', { orows: rows[0], orows2: rows[1], orows3: rows[2], p_order: req.query.p_order });
    });
});
module.exports = router