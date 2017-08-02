const mysql = require('./mysql');
const log = require('./logger').getLogger("system");
module.exports.check = function (req) {
    var url = req.url;
    log.info("requst url:", url);
    var menu_roles = req.session.menu_roles;
    var exists = false;
    if (url.indexOf('/login') == 0 || url == '/' || url == '/401' || url == '/error') {
        exists = true;
    } else {
        for (var i = 0; i < menu_roles.length; i++) {
            var menu_role = menu_roles[i];
            var menu_url = menu_role['menu_url'];
            if (menu_url != "" && url.indexOf(menu_url) == 0) {
                exists = true;
                break;
            }
        }
    }
    return exists;
};