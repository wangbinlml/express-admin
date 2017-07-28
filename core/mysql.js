var mysql = require('mysql');
var commonUtil = require('./util/commonUtil');
var config = require(commonUtil.getConfigPath() + "/db_config").mysql;
var logger = require("./logger").getLogger("system");
logger.info("hbb mysql config ", JSON.stringify(config));

var pool = mysql.createPool(config);
pool.on('connection', function (connection) {
    //logger.info("connection!");
});

pool.on('enqueue', function () {
    //logger.info('Waiting for available connection slot');
});

module.exports.Pool = pool;

module.exports.getConnection = function (cb) {
    pool.getConnection(function (err, connection) {
        cb(err, connection);
    });
};
module.exports.query = function (sql, values, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            cb(err);
        } else {
            connection.query(sql, values, function (error, rows) {
                cb(error,rows);
            });
            connection.release();
        }
    });
};

//检查是否链接失败
this.getConnection(function (err, connection) {
    if (err) throw err;
    else {
        logger.info("connected success!");
        connection.release();
    }
});
