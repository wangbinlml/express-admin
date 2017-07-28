var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        user: req.session.user,
        menus: req.session.menus,
        title: 'Express'
    });
});

module.exports = router;
