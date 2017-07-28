var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(express().get('views'));
    res.render('index', {
        user: req.session.user,
        title: 'Express'
    });
});

module.exports = router;
