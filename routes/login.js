var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', {title: 'Login', msg: "请输入您的用户名和密码"});
});

/* POST */
router.post("/", function (req, res, next) {
    console.log(req.body)
    res.status(200).json({error:1,msg:"用户名或者密码错误"});
});
module.exports = router;
