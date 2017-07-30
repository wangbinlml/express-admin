const express = require('express');
const mysql = require('../core/mysql');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('user_role', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/user_role'],
        title: '用户角色管理'
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
    sql = sql + "  order by id asc  limit " + start + "," + length;
    var result = await mysql.querySync(sql);
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
        sql = "select b.user_id,a.user_name,a.name,b.role_id,c.role_name,c.description from bs_user a left join bs_user_role b on a.id=b.user_id left join bs_role c on b.role_id=c.role_id where a.id=?";
        var userRoles = await mysql.querySync(sql, user_id);
        if (userRoles.length > 0) {
            var role_name = "";
            for (var j = 0; j < userRoles.length; j++) {
                var userRole = userRoles[j];
                if(j == 0) {
                    role_name = userRole['role_name'];
                } else {
                    role_name = role_name + ', ' + userRole['role_name'];
                }
            }
            obj['role_name'] = role_name;
        } else {
            obj['role_name'] = "";
        }

        obj['is'] = obj['id'] + "_";
        data.push(obj);
    }
    backResult.data = data;
    res.status(200).json(backResult);
});

module.exports = router;
