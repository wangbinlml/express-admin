var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/'],
        title: 'Express'
    });
});

module.exports = router;
