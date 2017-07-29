const express = require('express');
const router = express.Router();
const stringUtils = require("../core/util/StringUtils");
const mysql = require('../core/mysql');
const _ = require('lodash');
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
    var username = req.body.username;
    var password = req.body.password;
    var is_remember = req.body.is_remember;
    var sql = "select * from bs_user where user_name=? and password = ?";
    var users = await mysql.querySync(sql, [username, stringUtils.createPassword(req.body.password)]);
    if (users.length > 0) {
        var user = users[0];
        req.session.user = user;
        var sql = "select a.user_id,b.role_id,b.role_name,b.description,d.menu_id,d.parent_id,d.menu_name,d.menu_url,d.menu_icon from bs_user_role a LEFT JOIN bs_role b ON a.role_id =b.role_id LEFT JOIN bs_menu_role c ON b.role_id = c.role_id LEFT JOIN bs_menu d ON c.menu_id = d.menu_id where a.user_id=? ORDER BY d.parent_id ASC,d.menu_id ASC";
        var menu_roles = await mysql.querySync(sql, user['id']);
        var menus = [];
        var userRole = [];
        var menu_active = {};
        if (menu_roles.length) {
            for (var i = 0; i < menu_roles.length; i++) {
                var menuRoleObj = menu_roles[i];
                var parent_id = menuRoleObj['parent_id'];
                if (_.indexOf(userRole, menuRoleObj['role_id']) == -1) {
                    userRole.push(menuRoleObj['role_id']);
                }
                if (parent_id == 0) {
                    var menuObj = {};
                    menuObj['parent_id'] = parent_id;
                    menuObj['menu_id'] = menuRoleObj['menu_id'];
                    menuObj['menu_name'] = menuRoleObj['menu_name'];
                    menuObj['menu_url'] = menuRoleObj['menu_url'];
                    menuObj['menu_icon'] = menuRoleObj['menu_icon'];
                    menuObj['menu_child'] = [];
                    menus.push(menuObj);
                    menu_active[menuRoleObj['menu_url']] = {}
                } else {
                    for (var j = 0; j < menus.length; j++) {
                        var menuObj = menus[j];
                        var pid = menuObj['menu_id'];
                        if (pid == parent_id) {
                            var childObj = {}, menu_id = menuRoleObj['menu_id'], menu_url = menuRoleObj['menu_url'];
                            childObj['menu_id'] = menu_id;
                            childObj['parent_id'] = menuRoleObj['parent_id'];
                            childObj['menu_name'] = menuRoleObj['menu_name'];
                            childObj['menu_url'] = menu_url;
                            childObj['menu_icon'] = menuRoleObj['menu_icon'];
                            menuObj['menu_child'].push(childObj);
                            menu_active[menu_url] = {parent_id: parent_id, menu_id: menu_id}
                        }
                    }
                }

            }
        }
        req.session.userRole = userRole;
        req.session.menus = menus;
        req.session.menu_active = menu_active;
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
