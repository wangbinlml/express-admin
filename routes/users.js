const express = require('express');
const mysql = require('../core/mysql');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('user', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/users'],
        title: '用户管理'
    });
});
router.get('/load', async(req, res, next) => {
    var sqlcount = "select count(*) count from bs_user";
    var sql = "select * from bs_user";

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
            birthday: result[i].birthday
        });
    }
    res.status(200).json(backResult);
});

module.exports = router;
