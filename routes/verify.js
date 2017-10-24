var express = require('express');
var router = express.Router();
var VerifyCode = require('../core/util/VerifyCode');
/* GET home page. */
router.get('/', async function (req, res, next) {
    var data = VerifyCode.Generate(4,80,33,'normal 30px Arial');
    req.session.verify_code = data.code;
    res.end(data.buffer);
});

module.exports = router;
