const express = require('express');
const mysql = require('../core/mysql');
const log = require('../core/logger').getLogger("system");
const router = express.Router();
const _ = require('lodash');
const common = require('../core/common');
const menu_auth = require("../core/menu_auth");
const stringUtils = require("../core/util/StringUtils");

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('menu_role', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/menu_role'] || {},
        title: '菜单权限管理'
    });
});

router.get('/get_menu', async (req, res, next) => {
    var result = {
        error: 0,
        data: {}
    };
    try {
        var role_id = req.query.role_id;
        // 角色 role_id 能看到和操作菜单权限
        var sql = "select a.menu_id from bs_menu a inner join bs_menu_role b on a.menu_id=b.menu_id where b.role_id=? and a.is_del=0";
        // 所有菜单权限
        var sql2 = "select * from bs_menu where is_del=0 order by parent_id asc , menu_id asc";
        var menuIds = await mysql.query(sql, role_id);
        var menus = await mysql.query(sql2);
        //result.data['menus'] = menus;//stringUtils.MenuRecursion(menus, 0);
        var rMenus = [];
        for (var i = 0; i < menus.length; i++) {
            var menu = menus[i];
            menu['checked'] = false;
            // 第一级菜单打开
            if (menu['parent_id'] == 0) {
                menu['open'] = true;
            }
            for (var j = 0; j < menuIds.length; j++) {
                if(menuIds[j]['menu_id']  == menu['menu_id']) {
                    menu['checked'] = true;
                    continue;
                }
            }
            rMenus.push(menu);
        }
        result.data = rMenus;
        res.status(200).json(result);
    } catch (e) {
        log.error(e);
        result.error = 1;
        res.status(500).json(result);
    }
});

router.get('/load', async (req, res, next) => {
    var sqlcount = "select count(*) count from bs_role where is_del=0";
    var sql = "select * from bs_role where is_del=0";

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
        sqlcount = sqlcount + " and role_name like '%" + search.value + "%'";
        sql = sql + " and role_name like '%" + search.value + "%'";
    }

    var memuCount = await mysql.query(sqlcount);
    sql = sql + " ORDER BY role_id ASC limit " + start + "," + length;
    var result = await mysql.query(sql);
    var backResult = {
        draw: draw,
        recordsTotal: memuCount['0']['count'],
        recordsFiltered: memuCount['0']['count'],
        data: []
    };
    for (var i in result) {
        backResult.data.push({
            role_id: result[i].role_id,
            is: result[i].role_id + "_",
            role_name: result[i].role_name,
            description: result[i].description,
        });
    }
    res.status(200).json(backResult);
});
router.post('/setMenu', async (req, res, next) => {
    var user = req.session.user;
    var result = {
        error: 0,
        msg: "",
        data: []
    };
    var e_id = req.body.e_id;
    var e_menus = req.body.e_menus || "";
    if (e_id && e_id != "" && e_id != 0) {
        if(e_menus == "") {
            result.error = 1;
            result.msg = "菜单权限为空，请选择该角色的菜单";
            res.status(200).json(result);
            return;
        }
        e_menus = e_menus.split(",");
        var conn = await mysql.getConnection();
        await mysql.beginTransaction(conn);
        try {
            if (!_.isArray(e_menus)) {
                e_menus = [e_menus]
            }
            var sql = "delete from bs_menu_role where role_id = ?";
            var sql2 = "insert into bs_menu_role(role_id, menu_id) values (?,?)";
            await mysql.query2(conn, sql, e_id);
            for (var i = 0; i < e_menus.length; i++) {
                await mysql.query2(conn, sql2, [e_id, e_menus[i]]);
            }
            await mysql.commit(conn);
            if(user && user['id']) {
                await menu_auth.setMenus(req, user['id']);
            }
            await common.saveOperateLog(req, "绑定菜单ID:" + e_id + ";roles:" + e_menus);
            res.status(200).json(result);
        } catch (e) {
            mysql.rollback(conn);
            log.error("menu_role set menu: ", e);
            result.error = 1;
            res.status(500).json(result);
        }
    } else {
        result.error = 1;
        result.msg = "无效角色";
        res.status(200).json(result);
    }
});
module.exports = router;
