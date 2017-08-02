const express = require('express');
const mysql = require('../core/mysql');
const router = express.Router();
const log = require('../core/logger').getLogger("system");
const moment = require('moment');
/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('user', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/users'],
        title: '用户管理'
    });
});
router.get('/load', async (req, res, next) => {
    try {
        var sqlcount = "select count(*) count from bs_user";
        var sql = "select * from bs_user";

        var s_name = req.query.s_name;
        var s_user_name = req.query.s_user_name;

        if (s_name) {
            sqlcount = sqlcount + " where name like '%" + s_name.trim() + "%'";
            sql = sql + " where name like '%" + s_name.trim() + "%'";
        }
        if (s_user_name) {
            sqlcount = sqlcount + " where user_name like '%" + s_user_name.trim() + "%'";
            sql = sql + " where user_name like '%" + s_user_name.trim() + "%'";
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
        var memuCount = await mysql.querySync(sqlcount);
        sql = sql + " ORDER BY id DESC limit " + start + "," + length;
        var result = await mysql.querySync(sql);
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
                user_name: result[i].user_name,
                name: result[i].name,
                mail: result[i].mail,
                phone: result[i].tel,
                sex: result[i].sex == "0" ? "男" : "女",
                birthday: result[i].birthday ? moment(result[i].birthday).format("YYYY-MM-DD") : ""
            });
        }
        res.status(200).json(backResult);
    } catch (e) {
        log.error("e");
        res.status(500).json({error: 1, msg: '内部错误'});
    }
});

router.get('/update', async (req, res, next) => {
    var e_id = req.query.e_id;
    var e_user_name = req.query.e_user_name;
    var e_name = req.query.e_name;
    var e_phone = req.query.e_phone;
    var e_sex = req.query.e_sex;
    var e_birthday = req.query.e_birthday;
    var e_mail = req.query.e_mail;
    var result = {
        error: 0,
        msg: ""
    };
    if (e_id == "" || e_id.trim() == "") {
        result.msg = "编号不能为空";
    } else if (e_user_name == "" || e_user_name.trim() == "") {
        result.msg = "登录名不能为空";
    }
    else if (e_name == "" || e_name.trim() == "") {
        result.msg = "用户名称不能为空";
    }
    else if (e_phone == "" || e_phone.trim() == "") {
        result.msg = "手机号不能为空";
    }
    if(result.msg != "") {
        result.error = 1;
    }
    res.status(200).json(result);
});
module.exports = router;
