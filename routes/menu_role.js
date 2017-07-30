const express = require('express');
const mysql = require('../core/mysql');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('menu_role', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/menu_role'],
        title: '菜单权限管理'
    });
});
router.get('/load', async(req, res, next) => {
    var sqlcount = "select count(*) count from bs_role";
    var sql = "select * from bs_role";

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
    sql = sql + " ORDER BY role_id ASC limit " + start + "," + length;
    var result = await mysql.querySync(sql);
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

module.exports = router;
