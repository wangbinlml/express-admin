const express = require('express');
const mysql = require('../core/mysql');
const log = require('../core/logger').getLogger("system");
const router = express.Router();
const _ = require('lodash');
const moment = require('moment');

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('login_log', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/login_log'] || {},
        title: '登录日志'
    });
});
router.get('/load', async(req, res, next) => {
    var sqlcount = "select count(*) count from bs_login_log ";
    var sql = "select * from bs_login_log ";

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
        sqlcount = sqlcount + " where ip like '%" + search.value + "%'";
        sql = sql + " where ip like '%" + search.value + "%'";
    }

    var memuCount = await mysql.query(sqlcount);
    sql = sql + " ORDER BY login_time DESC limit " + start + "," + length;
    var result = await mysql.query(sql);
    var backResult = {
        draw: draw,
        recordsTotal: memuCount['0']['count'],
        recordsFiltered: memuCount['0']['count'],
        data: []
    };
    for (var i in result) {
        backResult.data.push({
            id: result[i].id,
            is: result[i].id + "_",
            ip: result[i].ip,
            user_name: result[i].user_name,
            name: result[i].name,
            login_time: moment(result[i].login_time).format("YYYY-MM-DD HH:mm:ss"),
        });
    }
    res.status(200).json(backResult);
});
router.delete('/delete', async(req, res, next) => {
    var result = {
        error: 0,
        msg: ""
    };

    try {
        log.info("delete login log params: ", req.body);
        var ids = req.body.ids;
        if (ids && ids.trim() != "") {
            ids = ids.split(",");
            var sql = 'delete from bs_login_log where id in (';
            for (var i = 0; i < ids.length; i++) {
                if (i == 0) {
                    sql = sql + ids[i];
                } else {
                    sql = sql + "," + ids[i];
                }
            }
            sql = sql + ")";
            await mysql.query(sql);
        } else {
            result.error = 1;
            result.msg = "删除失败，必须选择一项";
        }
    } catch (e) {
        log.error("delete login log ret:", e);
        result.error = 1;
        result.msg = "删除失败，请联系管理员";
    }
    res.status(200).json(result);
});
module.exports = router;
