const mysql = require('mysql');
const commonUtil = require('./util/commonUtil');
const config = require(commonUtil.getConfigPath() + "/db_config").mysql;
const logger = require("./logger").getLogger("system");
logger.info("hbb mysql config ", JSON.stringify(config));

const pool = mysql.createPool(config);
pool.on('connection', (connection) => {
    //logger.info("connection!");
});

pool.on('enqueue', () => {
    //logger.info('Waiting for available connection slot');
});

module.exports.Pool = pool;

module.exports.getConnection = (cb) => {
    pool.getConnection(function (err, connection) {
        cb(err, connection);
    });
};
module.exports.querySync = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, values, (error, rows) => {
                    if (error) reject(error);
                    resolve(rows);
                });
                connection.release();
            }
        });
    });
};
module.exports.query = (sql, values, cb) => {
    pool.getConnection((err, connection) => {
        if (err) {
            cb(err);
        } else {
            connection.query(sql, values, (error, rows) => {
                cb(error, rows);
            });
            connection.release();
        }
    });
};

//检查是否链接失败
this.getConnection((err, connection) => {
    if (err) throw err;
    else {
        logger.info("connected success!");
        connection.release();
    }
});
