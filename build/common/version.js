const fs       = require('fs');
const path     = require('path');
module.exports = function (app) {
    return new Promise(function(resolve, reject) {
        let v;
        if(app.condition){
            v = new Date().Format("MMddhhmm");
        }else{
            try {
                v = fs.readFileSync(path.join(process.cwd(),'.version'),'utf8')
                console.log(v)
            } catch(e) {
                v = 'dev';
            }
        }

        fs.writeFile('../.version', v, (err) => {
            if (err) reject(new Error(err));
            resolve(v); 
        });
    })
}
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}