const express = require('express');
const mysql = require('../core/mysql');
const router = express.Router();
const log = require('../core/logger').getLogger("system");
var menu_auth = require("../core/menu_auth");
var common = require("../core/common");

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('menu', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/menus'],
        title: '菜单管理',
        router: '/menus'
    });
});
router.get('/load', async (req, res, next) => {
    var menus = req.session.menus;
    var parentMenu = {};
    for (var i = 0; i < menus.length; i++) {
        var menu = menus[i];
        parentMenu[menu['menu_id']] = menu['menu_name'];
    }
    var sqlcount = "select count(*) count from bs_menu";
    var sql = "select * from bs_menu";

    var start = req.query.start;
    var length = req.query.length;
    var draw = req.query.draw;
    if (!start || !draw || !length) {
        res.status(401).json("invoke error!");
        return;
    }

    start = parseInt(start) || 0;
    length = parseInt(length) || 0;
    draw = parseInt(draw) || 0;

    var search = req.query.search;
    if (search) {
        sqlcount = sqlcount + " where menu_name like '%" + search.value + "%'";
        sql = sql + " where menu_name like '%" + search.value + "%'";
    }

    var memuCount = await mysql.querySync(sqlcount);
    sql = sql + " ORDER BY parent_id ASC,menu_id ASC limit " + start + "," + length;
    var result = await mysql.querySync(sql);
    var backResult = {
        draw: draw,
        recordsTotal: memuCount['0']['count'],
        recordsFiltered: memuCount['0']['count'],
        data: []
    };
    for (var i in result) {
        backResult.data.push({
            id: result[i].menu_id,
            is: result[i].menu_id + "_",
            parent_id: result[i].parent_id,
            menu_name: result[i].menu_name,
            parent_menu_name: parentMenu[result[i].parent_id] || "无",
            menu_url: result[i].menu_url,
            menu_icon: result[i].menu_icon
        });
    }
    res.status(200).json(backResult);
});

router.get('/getParentMenu', async (req, res, next) => {
    try {
        var sql = "select * from bs_menu where parent_id=0";
        var result = await mysql.querySync(sql);
        res.status(200).json({
            error: 0,
            msg: "",
            data: result
        });
    } catch (e) {
        log.error("get parent menu: ", e);
        res.status(500).json({
            error: 0,
            msg: "获取父级菜单失败，请联系管理"
        });
    }
});
router.get('/save', async (req, res, next) => {
    var result = {
        error: 0,
        msg: ""
    };
    try {
        var user = req.session.user;
        log.info("save menu params: ", req.query);
        var e_id = req.query.e_id;
        var e_menu_name = req.query.e_menu_name;
        var e_parent_id = req.query.e_parent_id;
        var e_menu_url = req.query.e_menu_url;
        var e_menu_icon = req.query.e_menu_icon;
        if (e_menu_name == "" || e_menu_name.trim() == "") {
            result.msg = "角色不能为空";
        }
        if (result.msg != "") {
            result.error = 1;
        } else {
            var ret, sql;
            if (e_id) {
                sql = "update bs_menu set menu_name=?,parent_id=?,menu_url=?,menu_icon=? where menu_id=?";
                var params = [e_menu_name, e_parent_id, e_menu_url, e_menu_icon, e_id];
                ret = await mysql.querySync(sql, params);
                await common.saveOperateLog(req, "更新菜单：" + e_menu_name + ";ID: " + e_id);
            } else {
                sql = "select * from bs_menu where menu_name=?";
                var users = await mysql.querySync(sql, e_menu_name);
                if (users.length > 0) {
                    result.error = 1;
                    result.msg = "菜单名已经存在！";
                } else {
                    sql = "insert bs_menu(menu_name, parent_id,menu_url,menu_icon) values (?,?,?,?)";
                    ret = await mysql.querySync(sql, [e_menu_name, e_parent_id, e_menu_url, e_menu_icon]);
                    await common.saveOperateLog(req, "新增菜单：" + e_menu_name);
                }
            }
            log.info("save menu ret: ", ret);
            // session中设置菜单
            menu_auth.setMenus(req, user['id']);
        }
        res.status(200).json(result);
    } catch (e) {
        log.error("save menu ret:", e);
        result.error = 1;
        result.msg = "保存失败，请联系管理员";
        res.status(200).json(result);
    }
});
router.delete('/delete', async (req, res, next) => {
    var result = {
        error: 0,
        msg: ""
    };

    var user = req.session.user;
    log.info("delete menu params: ", req.body);
    var ids = req.body.ids;
    if (ids && ids.trim() != "") {
        var conn = await mysql.getConnectionSync();
        try {
            ids = ids.split(",");
            var pSql = "select * from bs_menu where parent_id in (";
            var sql = 'delete from bs_menu_role where menu_id in (';
            var sql3 = 'delete from bs_menu where menu_id in (';
            for (var i = 0; i < ids.length; i++) {
                if (i == 0) {
                    sql = sql + ids[i];
                    sql3 = sql3 + ids[i];
                    pSql = pSql + ids[i];
                } else {
                    sql = sql + "," + ids[i];
                    sql3 = sql3 + "," + ids[i];
                    pSql = pSql + "," + ids[i];
                }
            }
            sql = sql + ")";
            sql3 = sql3 + ")";
            pSql = pSql + ")";
            var parentMenu = await mysql.querySync2(conn, pSql);
            if (parentMenu && parentMenu.length > 0) {
                result.error = 1;
                result.msg = "删除项有子菜单，需要先删除子菜单";
                await mysql.rollbackSync(conn);
            } else {
                await mysql.querySync2(conn, sql);
                await mysql.querySync2(conn, sql3);
                await mysql.commitSync(conn);

                // session中设置菜单
                await menu_auth.setMenus(req, user['id']);
                await common.saveOperateLog(req, "删除菜单ID: " + ids);
            }
        } catch (e) {
            log.error("delete menu ret:", e);
            result.error = 1;
            result.msg = "删除失败，请联系管理员";
            await mysql.rollbackSync(conn);
        }
    } else {
        result.error = 1;
        result.msg = "删除失败，必须选择一项";
    }
    res.status(200).json(result);
});
module.exports = router;
