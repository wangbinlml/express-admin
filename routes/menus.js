const express = require('express');
const mysql = require('../core/mysql');
const router = express.Router();
const log = require('../core/logger').getLogger("system");
const menu_auth = require("../core/menu_auth");
const common = require("../core/common");
const moment = require("moment");
const stringUtils = require('../core/util/StringUtils');

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('menu', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/menus'] || {},
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
    var sqlcount = "select count(*) count from bs_menu where is_del=0";
    var sql = "select * from bs_menu where is_del=0";

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
        sqlcount = sqlcount + " and menu_name like '%" + search.value + "%'";
        sql = sql + " and menu_name like '%" + search.value + "%'";
    }

    var memuCount = await mysql.query(sqlcount);
    sql = sql + " ORDER BY parent_id ASC,menu_id ASC limit " + start + "," + length;
    var result = await mysql.query(sql);
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
            menu_icon: result[i].menu_icon,
            created_at: result[i].created_at ? moment(result[i].created_at).format("YYYY-MM-DD HH:mm:ss") : "",
            modified_at: result[i].modified_at != "0000-00-00 00:00:00" ? moment(result[i].modified_at).format("YYYY-MM-DD HH:mm:ss") : "",
        });
    }
    res.status(200).json(backResult);
});
router.get('/tree', async (req, res, next) => {
    var tree = req.query.tree;
    var result = {
        error: 0,
        data: {}
    };
    try {
        var sql = "select * from bs_menu where is_del=0 ";
        if(tree) {
            sql = sql + " and type = 0 "
        }
        sql = sql + "order by parent_id asc , menu_id asc";
        var menus = await mysql.query(sql);
        result.data = menus;
        res.status(200).json(result);

    } catch (e) {
        result.error = 1;
        res.status(500).json(result);
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
        var e_type = req.query.e_type || 0;
        var e_menu_flag = req.query.e_menu_flag;
        if (e_menu_name == "" || e_menu_name.trim() == "") {
            result.msg = "菜单名称不能为空";
        }
        if (result.msg != "") {
            result.error = 1;
        } else {
            if(e_menu_flag) {
                sql = "select * from bs_menu where menu_flag=? and is_del=0 and type = 0";
                var menus = await mysql.query(sql, e_menu_flag);
                if (((!e_id || e_id == 0) && menus.length > 0) || (e_id && e_id != 0 && menus.length > 0 && e_id != menus[0]['menu_id'])) {
                        result.error = 1;
                        result.msg = "菜单唯一标识已经存在！";
                        res.status(200).json(result);
                        return;
                }
            }
            var ret, sql;
            if (e_id && e_id != 0) {
                sql = "update bs_menu set menu_name=?,parent_id=?,menu_url=?,menu_icon=?, menu_flag=?, type=?, modified_id=?, modified_at=? where menu_id=?";
                var params = [e_menu_name, e_parent_id, e_menu_url, e_menu_icon, e_menu_flag, e_type, user.id, new Date(), e_id];
                ret = await mysql.query(sql, params);
                await common.saveOperateLog(req, "更新菜单：" + e_menu_name + ";ID: " + e_id);
            } else {
                sql = "select * from bs_menu where menu_name=? and is_del=0";
                var menus = await mysql.query(sql, e_menu_name);
                if (menus.length > 0) {
                    result.error = 1;
                    result.msg = "菜单名已经存在！";
                } else {
                    sql = "insert bs_menu(menu_name, parent_id,menu_url,menu_icon,menu_flag,type,creator_id) values (?,?,?,?,?,?,?)";
                    ret = await mysql.query(sql, [e_menu_name, e_parent_id, e_menu_url, e_menu_icon,e_menu_flag,e_type, user.id]);
                    await common.saveOperateLog(req, "新增菜单：" + e_menu_name);
                }
            }
            log.info("save menu ret: ", ret);
            // session中设置菜单
            await menu_auth.setMenus(req, user['id']);
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
        var conn = await mysql.getConnection();
        try {
            ids = ids.split(",");
            var pSql = "select * from bs_menu where parent_id in (";
            var sql = 'delete from bs_menu_role where menu_id in (';
            var sql3 = 'update bs_menu set is_del=1, modified_at=?, modified_id=? where menu_id in (';
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
            var parentMenu = await mysql.query2(conn, pSql);
            if (parentMenu && parentMenu.length > 0) {
                result.error = 1;
                result.msg = "删除项有子菜单，需要先删除子菜单";
                await mysql.rollback(conn);
            } else {
                await mysql.query2(conn, sql);
                await mysql.query2(conn, sql3, [new Date(), user.id]);
                await mysql.commit(conn);

                // session中设置菜单
                await menu_auth.setMenus(req, user['id']);
                await common.saveOperateLog(req, "删除菜单ID: " + ids);
            }
        } catch (e) {
            log.error("delete menu ret:", e);
            result.error = 1;
            result.msg = "删除失败，请联系管理员";
            await mysql.rollback(conn);
        }
    } else {
        result.error = 1;
        result.msg = "删除失败，必须选择一项";
    }
    res.status(200).json(result);
});

router.get('/detail', async (req, res, next) => {
    var menu_id = req.query.menu_id;
    var result = {
        error: 0,
        data: {}
    };
    try {
        var sql = "select * from bs_menu where is_del=0 and menu_id=?";
        var menus = await mysql.query(sql, menu_id);
        if(menus && menus.length>0) {
            menus = menus[0];
        }
        result.data = menus;
        res.status(200).json(result);

    } catch (e) {
        result.error = 1;
        res.status(500).json(result);
    }
});

module.exports = router;
