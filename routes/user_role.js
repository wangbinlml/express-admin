const express = require('express');
const mysql = require('../core/mysql');
const log = require('../core/logger').getLogger("system");
const router = express.Router();
const _ = require('lodash');
const common = require('../core/common');
const menu_auth = require("../core/menu_auth");

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('user_role', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/user_role'] || {},
        title: '用户角色管理'
    });
});
router.get('/load', async(req, res, next) => {
    var sqlcount = "select count(*) count from bs_user where is_del=0";
    var sql = "select * from bs_user where is_del=0";

    var s_name = req.query.s_name;
    var s_user_name = req.query.s_user_name;

    if (s_name) {
        sqlcount = sqlcount + " and name like '%" + s_name.trim() + "%'";
        sql = sql + " and name like '%" + s_name.trim() + "%'";
    }
    if (s_user_name) {
        sqlcount = sqlcount + " and user_name like '%" + s_user_name.trim() + "%'";
        sql = sql + " and user_name like '%" + s_user_name.trim() + "%'";
    }

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
    var memuCount = await mysql.query(sqlcount);
    sql = sql + "  order by id desc  limit " + start + "," + length;
    var result = await mysql.query(sql);
    var backResult = {
        draw: draw,
        recordsTotal: memuCount['0']['count'],
        recordsFiltered: memuCount['0']['count'],
        data: []
    };
    var data = [];
    for (var i in result) {
        var obj = result[i];
        var user_id = obj['id'];
        sql = "select b.user_id,a.user_name,a.name,b.role_id,c.role_name,c.description from bs_user a left join bs_user_role b on a.id=b.user_id left join bs_role c on b.role_id=c.role_id where a.id=? and a.is_del=0 and c.is_del=0";
        var userRoles = await mysql.query(sql, user_id);
        if (userRoles.length > 0) {
            var role_name = "", role_id = "";
            for (var j = 0; j < userRoles.length; j++) {
                var userRole = userRoles[j];
                if (j == 0) {
                    role_name = userRole['role_name'];
                    role_id = userRole['role_id'];
                } else {
                    role_name = role_name + ', ' + userRole['role_name'];
                    role_id = role_id + ',' + userRole['role_id'];
                }
            }
            obj['role_name'] = role_name;
            obj['role_id'] = role_id;
        } else {
            obj['role_name'] = "";
            obj['role_id'] = "";
        }

        obj['is'] = obj['id'] + "_";
        data.push(obj);
    }
    backResult.data = data;
    res.status(200).json(backResult);
});
router.get('/getRole', async(req, res, next) => {
    var result = {
        error: 0,
        data: []
    };
    try {
        var sql = "select role_id,role_name from bs_role where is_del=0";
        var data = await mysql.query(sql);
        result['data'] = data;
        res.status(200).json(result);
    } catch (e) {
        result.error = 1;
        res.status(500).json(result);
    }
});
router.post('/setRole', async(req, res, next) => {
    var user = req.session.user;
    var result = {
        error: 0,
        msg: "",
        data: []
    };
    var e_id = req.body.e_id;
    var e_roles = req.body.e_roles || [];
    if (e_id && e_id != "" && e_id != 0) {
        var conn = await mysql.getConnection();
        await mysql.beginTransaction(conn);
        try {
            if (!_.isArray(e_roles)) {
                e_roles = [e_roles]
            }
            var sql = "delete from bs_user_role where user_id = ?";
            var sql2 = "insert into bs_user_role(user_id,role_id) values (?,?)";
            await mysql.query2(conn, sql, e_id);
            for (var i = 0; i < e_roles.length; i++) {
                await mysql.query2(conn, sql2, [e_id, e_roles[i]]);
            }
            await mysql.commit(conn);
            if(user && user['id']) {
                await menu_auth.setMenus(req, user['id']);
            }
            await common.saveOperateLog(req, "绑定用户ID:" + e_id + ";roles:" + e_roles);
            res.status(200).json(result);
        } catch (e) {
            mysql.rollback(conn);
            log.error("user_role set role: ", e);
            result.error = 1;
            res.status(500).json(result);
        }
    } else {
        result.error = 1;
        result.msg = "无效用户";
        res.status(200).json(result);
    }
});
module.exports = router;
