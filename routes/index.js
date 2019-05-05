var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/'] || {},
        title: '首页'
    });
});
router.get('/welcome', function (req, res, next) {
    res.render('content', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/'] || {},
        title: '首页'
    });
});
router.get('/sidebar', function (req, res, next) {
    var result = {
        error: 0,
        data: req.session.menus2
    };
    res.status(200).json(result);
});

module.exports = router;
