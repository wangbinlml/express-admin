# express-admin
```
一个基于NodeJS Express框架的后台管理系统，包括登录，角色，菜单权限等。
redis: v3.0+, 
nodejs: v8.0+
```
# Demo

```
http://a.chenxun.org
username: test
password: test
```

# 安装
```
git clone https://github.com/wangbinlml/express-admin.git
cd express-admin
npm install 
```
#配置数据库
```
{
  "mysql": {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "demo",
    "port": 3306,
    "connectionLimit": 50,
    "acquireTimeout": 10000,
    "charset": "utf8"
  },
  "redis": {
    "cluster": false,
    "connect_info": [
      {
        "port": 6379,
        "host": "127.0.0.1"
      }
    ]
  }
}
```
# Todo List
- [X] 用户登录
- [X] 用户管理
- [x] 菜单管理
- [x] 权限管理
- [x] 用户角色管理
- [x] 菜单权限管理
- [x] 数据库整理
- [ ] 操作权限管理


# 界面预览

1.登录
--
![image](public/images/login.png)

2.首页
![image](public/images/main.png)