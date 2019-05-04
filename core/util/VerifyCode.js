/**
 * Description: 图片验证码
 * Created by wangbin.
 * Date: 16-9-5
 * Time: 上午11:42
 */
var Canvas = require('canvas');
/*
 * get random float value amount [start, end)
 */
var randFloat = function(start, end) {
    return start + Math.random() * (end - start);
};

/*
 * get random integer value amount [start, end)
 */
var randInt = function(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
};

exports.Generate = function(random, W, H, font) {
    var W = W || 90;
    var H = H || 25;
    var canvas = new Canvas(W, H);
    var ctx = canvas.getContext('2d');
    var items = 'abcdefghjkmnpqrstuvwxyz23456789'.split('');
    var vcode = '';

    ctx.rotate(0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    //ctx.font = '15px sans-serif';

    for (var i = 0; i < 10; i++) {
        ctx.fillStyle = 'rgb(' + randInt(150, 225) + ',' + randInt(150, 225) + ',' + randInt(150, 225) + ')';
        for (var j = 0; j < random+1; j++) {
            ctx.fillText(items[randInt(0, items.length)], randFloat(-10, W + 10), randFloat(-10, H + 10));
        }
    }

    var color = 'rgb(0,0,0)';
    //var color = 'rgb(' + randInt(1, 120) + ',' + randInt(1, 120) + ',' + randInt(1, 120) + ')';
    ctx.font = font || 'normal 30px sans-serif';
    for (var i = 0; i < random; i++) {
        var j = randInt(0, items.length);
        ctx.fillStyle = color;
        //ctx.fillText(items[j], 15 + i * 50, 50);
        ctx.fillText(items[j],  5 + i * 20, 25);
        /* var a = randFloat(0.85, 1.0);
         var b = randFloat(-0.02, 0.03);
         var c = randFloat(-0.1, 0.4);
         var d = randFloat(0.85, 1.0);
         ctx.transform(a, b, c, d, 0, 0);*/
        vcode += items[j];
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    /*var A = randFloat(10, H / 3);
     var b = randFloat(H / 6, 4 * H / 6);
     var f = randFloat(H / 6, 4 * H / 6);
     var T = randFloat(H * 1.5, W);
     var w = 4 * Math.PI / T;
     var S = function(x) {
     return A * Math.sin(w * x + f) + b;
     };
     ctx.lineWidth = 5;
     for (var x = -20; x < 600; x += random) {
     ctx.moveTo(x, S(x));
     ctx.lineTo(x + 3, S(x + 3));
     }
     */
    ctx.lineWidth = 5;
    ctx.closePath();
    ctx.stroke();
    //canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-src.png')));
    return {
        code: vcode.toLowerCase(),
        dataURL: canvas.toDataURL(),
        buffer: canvas.toBuffer()
    };
};