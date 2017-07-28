const express = require('express');
const router = express.Router();
const stringUtils = require("../core/util/StringUtils");
const mysql = require('../core/mysql');
/* GET home page. */
router.get('/', (req, res, next) => {
    const user = req.session.user;
    if (user) {
        res.redirect("/");
    }
    res.render('login', {title: 'Login', msg: "请输入您的用户名和密码"});
});
router.get('/exit', (req, res, next) => {
    req.session.destroy(function (err) {
        if (err) {
            console.error("--> session destroy failed.err -> ", err);
        }
    });
    res.redirect("/login");
});
/* POST */
router.post("/", async (req, res, next) => {
    console.log(req.body)
    const username = req.body.username;
    const password = req.body.password;
    const is_remember = req.body.is_remember;
    const sql = "select * from bs_user where user_name=? and password = ?";
    const user = await mysql.querySync(sql, [username, stringUtils.createPassword(req.body.password)]);
    if (user.length > 0) {
        req.session.user = user[0];
        // 当前用户角色

        if (is_remember) {
            res.cookie("login.username", username, {
                // 默认有效期为10年
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10
            });
        }
        res.redirect("/");
    } else {
        res.status(200).json({error: 1, msg: "用户名或者密码错误"});
    }
    console.log(user)
});
module.exports = router;
