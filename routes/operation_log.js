const express = require('express');
const mysql = require('../core/mysql');
const log = require('../core/logger').getLogger("system");
const router = express.Router();
const _ = require('lodash');
const moment = require('moment');

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('operation_log', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/operation_log'] || {},
        title: '操作日志'
    });
});
router.get('/load', async(req, res, next) => {
    var sqlcount = "select count(*) count from bs_operation_logs ";
    var sql = "select * from bs_operation_logs ";

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
        sqlcount = sqlcount + " where operations like '%" + search.value + "%'";
        sql = sql + " where operations like '%" + search.value + "%'";
    }

    var memuCount = await mysql.query(sqlcount);
    sql = sql + " ORDER BY operate_time DESC limit " + start + "," + length;
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
            operations: result[i].operations,
            user_name: result[i].user_name,
            name: result[i].name,
            operate_time: moment(result[i].operate_time).format("YYYY-MM-DD HH:mm:ss"),
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
        log.info("delete operation log params: ", req.body);
        var ids = req.body.ids;
        if (ids && ids.trim() != "") {
            ids = ids.split(",");
            var sql = 'delete from bs_operation_logs where id in (';
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
        log.error("delete operation log ret:", e);
        result.error = 1;
        result.msg = "删除失败，请联系管理员";
    }
    res.status(200).json(result);
});
module.exports = router;
