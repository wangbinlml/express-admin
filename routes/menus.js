var express = require('express');
var mysql = require('mysql');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('menu', {
        user: req.session.user,
        menus: req.session.menus,
        title: '菜单管理'
    });
});
router.get('/load', async (req, res, next) => {
    var sqlcount = "select count(*) from bs_user_role";
    var sql = "select * from bs_user_role";

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
    sql = sql + " ORDER BY parent_id ASC,menu_id ASC limit " + start + "," + length;
    var res = await mysql.querySync(sql);
    var backResult = {
        draw: draw,
        recordsTotal: memuCount,
        recordsFiltered: memuCount,
        data: []
    };
    for (var i in res) {
        backResult.data.push({
            id: res[i].menu_id,
            is: res[i].menu_id + "_",
            menu_name: res[i].menu_name,
            menu_url: res[i].menu_url,
            menu_icon: res[i].menu_icon
        });
    }
    res.status(200).json(backResult);
});

module.exports = router;
