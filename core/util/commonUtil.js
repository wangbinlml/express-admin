/**
 * 获取配置文件路径
 * @returns {string}
 */
exports.getConfigPath = function(){
    var configPath = process.cwd() + '/config';
    var applicationPath = process.argv.splice(4);
    if (applicationPath.length > 0) {
        applicationPath = applicationPath[0];
        applicationPath = applicationPath.split("=");
        applicationPath = applicationPath[1];
        configPath = applicationPath + '/config';
    }
    return configPath;
};