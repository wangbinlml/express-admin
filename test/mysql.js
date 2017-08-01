const mysql = require('../core/mysql');
const sql1 = 'insert into bs_role(role_name,description) value("a","b")';
const sql2 = 'insert into bs_role(role_name,description) value("c","c")';
(async () => {
    const conn = await mysql.getConnectionSync();
    try {
        await mysql.beginTransactionSync(conn);
        await mysql.querySync2(conn, sql1, "");
        await mysql.querySync2(conn, sql2, "");
        mysql.commitSync(conn);
        console.log('==============finish=====')
    } catch (e) {
        console.log('=========rollback!!===========');
        console.error(e)
        mysql.rollbackSync(conn);
    }
    process.exit(1);
})();