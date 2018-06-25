const express = require('express');
const router = express.Router();
const stringUtils = require("../core/util/StringUtils");
const mysql = require('../core/mysql');
const menu_auth = require("../core/menu_auth");
const common = require("../core/common");

/* GET home page. */
router.get('/', (req, res, next) => {
    const user = req.session && req.session.user;
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
router.post("/", async(req, res, next) => {
    console.log(req.body)
    var verify_code = req.session.verify_code;
    var username = req.body.username;
    var password = req.body.password;
    var verify = req.body.verify;
    var is_remember = req.body.is_remember;
    if(verify_code == verify) {
        var sql = "select * from bs_user where user_name=? and is_del=0";
        var users = await mysql.query(sql, [username]);
        if (users.length > 0) {
            var user = users[0];
            var salt = user.salt;
            var password2 = stringUtils.createPassword(password.trim()+salt);
            if(user.password != password2) {
                res.status(200).json({error: 1, msg: "用户名或者密码错误"});
                return;
            }
            req.session.user = user;
            // session中设置菜单
            await menu_auth.setMenus(req, user['id']);
            await common.saveLoginLog(req);
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
    } else {
        res.status(200).json({error: 1, msg: "验证码错误"});
    }
});
module.exports = router;
