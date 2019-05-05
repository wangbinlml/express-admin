const express = require('express');
const os=require('os');
const log = require('../core/logger').getLogger("system");
const mysql = require('../core/mysql');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        user: req.session.user,
        menus: req.session.menus,
        menu_active: req.session.menu_active['/'] || {},
        title: '首页'
    });
});
router.get('/welcome', async function (req, res, next) {

    //获取cpu(处理器架构)
    var arch=os.arch();
    //log.info(arch);

    //获取cpu信息
    var cpus=os.cpus();
    //log.info(cpus);

    //空闲内存字节
    var freemem=os.freemem()
    //log.info(freemem);

    //当前登录用户的根目录
    var homedir=os.homedir();
    //log.info(homedir);

    //操作系统主机名
    var hostname=os.hostname()
    //log.info(hostname);

    //系统最近5、10、15分钟的平均负载,这是一个针对linux或unix的统计，windows下始终返回[0,0,0]
    var loadavg=os.loadavg();
    //log.info(loadavg);

    //网络配置列表
    //var networkInterfaces=os.networkInterfaces();
    //log.info(networkInterfaces);

    //操作系统类型,返回值有'darwin', 'freebsd', 'linux', 'sunos' , 'win32'
    var platform=os.platform();
    //log.info(platform);

    //操作系统版本
    var release=os.release();
    //log.info(release);

    //操作系统临时文件的默认目录
    //var tmpdir=os.tmpdir()
    //log.info(tmpdir);

    //系统总内存
    var totalmem=os.totalmem()
    //log.info(totalmem);

    //操作系统名称，基于linux的返回linux,基于苹果的返回Darwin,基于windows的返回Windows_NT
    var type=os.type();
    //log.info(type);

    //计算机正常运行时间
    var uptime=os.uptime();
    //log.info(uptime);

    var data = {
        arch:arch,
        cpus:cpus[0]['model'],
        freemem: freemem,
        hostname: hostname,
        loadavg: loadavg,
        platform: platform,
        release: release,
        totalmem: totalmem,
        type: type,
        uptime: uptime
    };

    var sql = "select * from bs_operation_logs ";
    sql = sql + " ORDER BY operate_time DESC limit 0,10";
    var operation_logs = await mysql.query(sql);

    sql = "select * from bs_login_log ";
    sql = sql + " ORDER BY login_time DESC limit 0,10";
    var login_time = await mysql.query(sql);

    res.render('content', {
        user: req.session.user,
        menus: req.session.menus,
        data: data,
        operation_logs: operation_logs,
        login_time: login_time,
        menu_active: req.session.menu_active['/'] || {},
        title: '首页'
    });
});
router.get('/sidebar', function (req, res, next) {
    var result = {
        error: 0,
        data: req.session.menus2
    };
    res.status(200).json(result);
});

module.exports = router;
