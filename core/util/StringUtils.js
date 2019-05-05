var crypto = require("crypto");
// 用户头像背景色
var HEAD_COLOR_ARR = [
    "#f4a739",
    "#f9886d",
    "#6fb7e7",
    "#8ec566",
    "#f97c94",
    "#bdce00",
    "#f794be",
    "#7ccfde",
    "#b0a1d3",
    "#ff9c9c",
    "#80e2c5",
    "#eebd93",
    "#b4beef",
    "#f1aea8",
    "#9abfdf",
    "#ed8aa6",
    "#e2d240",
    "#e97984",
    "#acd3be",
    "#d8a7ca",
    "#98da8e",
    "#eeaa93",
    "#f7ae4a",
    "#fcca4d",
    "#e8c707",
    "#f299af",
    "#94ca76",
    "#c4d926",
    "#d6c7b0",
    "#a1d8ef"
];
var PASSWORD_SALT = "njxtqgjyptfromlianchuang";

var SYSTEM_PASSWORD_SALT = "hbb_bs_2016";

/**
 * 根据指定字符串生成加密后的密码<br />
 * 加密方式:将密码+固定盐值（SALT）先进行md5得到二进制字节数组后再进行Base64加密得到密文结果
 * @param password 明文密码
 * @returns 加密密码
 */
module.exports.generatePassword = function (password) {
    return crypto.createHash("md5").update(password + PASSWORD_SALT).digest("base64");
};


/**
 * 随机生成头像背景色
 * @returns {string}背景色
 */
module.exports.generateHeadColor = function () {
    return HEAD_COLOR_ARR[Math.floor(Math.random() * HEAD_COLOR_ARR.length)];
};


/**
 * 根据指定的字符串生成本系统所需加密密码
 * @param str 字符串
 * @returns {string}加密密码
 */
module.exports.createPassword = function (str) {
    return crypto.createHash("md5").update(str + SYSTEM_PASSWORD_SALT).digest("base64");
};


module.exports.md5 = function (text) {
    return crypto.createHash('md5').update(text).digest('hex');
};
module.exports.getReqRemoteIp = function (req) {
    var ip = req.headers["x-real-ip"] || req.ip;
    return ip;
};
/*
 * 递归遍历
 * @param data array
 * @param id int
 * return array
 * */
exports.MenuRecursion = (data, parent_id) => {
    let list = [];
    for (let index = 0; index < data.length; index++) {
        let obj = data[ index ];
        let v = {
            menu_id: obj.menu_id,
            menu_name: obj.menu_name,
            menu_url: obj.menu_url,
            parent_id: obj.parent_id,
            menu_icon: obj.menu_icon,
            type: obj.type
        };
        if (parent_id == obj[ 'parent_id' ]) {
            v[ 'menu_child' ] = this.MenuRecursion(data, obj[ 'menu_id' ]);
            list.push(v);
        }
    }
    return list;
};

exports.sidebarRecursion = (data, parent_id) => {
    let list = [];
    for (let index = 0; index < data.length; index++) {
        let obj = data[ index ];
        let v = {
            id: obj.menu_id,
            text: obj.menu_name,
            url: obj.menu_url,
            parent_id: obj.parent_id,
            icon: obj.menu_icon,
            targetType: 'iframe-tab',
            type: obj.type
        };
        if (parent_id == obj[ 'parent_id' ]) {
            v[ 'children' ] = this.sidebarRecursion(data, obj[ 'menu_id' ]);
            list.push(v);
        }
    }
    return list;
};
