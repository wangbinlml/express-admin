const express = require('express');
const router = express.Router();
const stringUtils = require("../core/util/StringUtils");
const mysql = require('../core/mysql');
const menu_auth = require("../core/menu_auth");
const common = require("../core/common");
const jwt = require('jsonwebtoken'); // 使用jwt签名
const app = express();

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
// 用户授权
router.post('/authenticate', async (req, res, next) => {
    console.log(req.body)
    var verify_code = req.session.verify_code;
    var username = req.body.username;
    var password = req.body.password;
    var verify = req.body.verify;
    var is_remember = req.body.is_remember;
    if (verify_code == verify) {
        var sql = "select * from bs_user where user_name=? and is_del=0";
        var users = await mysql.query(sql, [username]);
        if (users.length > 0) {
            var user = users[0];
            var salt = user.salt;
            var password2 = stringUtils.createPassword(password.trim() + salt);
            if (user.password != password2) {
                res.status(200).json({error: 1, msg: "用户名或者密码错误"});
                return;
            }

            const token = jwt.sign(user, app.get('superSecret'), {
                expiresIn: 60 * 60 * 24// 授权时效24小时
            });
            res.status(200).json({
                success: true,
                message: '登录成功',
                token: token
            });
            // session中设置菜单
            await menu_auth.setMenus(req, user['id']);
            await common.saveLoginLog(req);
            if (is_remember) {
                res.cookie("login.username", username, {
                    // 默认有效期为10年
                    maxAge: 1000 * 60 * 60 * 24 * 365 * 10
                });
            }
            //res.redirect("/");
        } else {
            res.status(200).json({error: 1, msg: "用户名或者密码错误"});
        }
    } else {
        res.status(200).json({error: 1, msg: "验证码错误"});
    }

    User.findOne({
        name: req.body.name
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({success: false, message: '未找到授权用户'});
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({success: false, message: '用户密码错误'});
            } else {
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 60 * 60 * 24// 授权时效24小时
                });
                res.json({
                    success: true,
                    message: '请使用您的授权码',
                    token: token
                });
            }
        }
    });
});

/* POST */
router.post("/", async (req, res, next) => {
    console.log(req.body)
    var verify_code = req.session.verify_code;
    var username = req.body.username;
    var password = req.body.password;
    var verify = req.body.verify;
    var is_remember = req.body.is_remember;
    if (verify_code == verify) {
        var sql = "select * from bs_user where user_name=? and is_del=0";
        var users = await mysql.query(sql, [username]);
        if (users.length > 0) {
            var user = users[0];
            var salt = user.salt;
            var password2 = stringUtils.createPassword(password.trim() + salt);
            if (user.password != password2) {
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
