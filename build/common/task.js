const { gulp, es }  = require('./plugins.js');
const path          = require('path');
module.exports = function (app) {
    return new Promise(function(resolve, reject) {
        let tasks = [];
        gulp.src(app.task([
            '**/*.task.js'
        ]))
        .pipe(es.map(function(file, cb){
            let json = {}
            let m    = '*';
            try {
                json = require(file.path);
            } catch(e) {
                reject(new Error(e))
            }
            let ps = path.relative(app.base(), file.path)
            if(!/^\.\.\//.test(ps)){
                m = ps.split('/')[0];
            }

            let pt = path.relative(app.tbase(), file.path)
            if(!/^\.\.\//.test(pt)){
                m = pt.split('/')[0];
            }
            if(Array.isArray(json)){
                json.map(function(task){
                    task.module = task.module ? task.module : m;
                    tasks.push(task);
                });
                cb(null, tasks);
            }else{
                cb('task is not a Array: '+ file.path, file);
            }
          })
        )
        .on("end", function(data){
            resolve(tasks);
        })
        .on("error", function(error){
            reject(new Error(error));
        })
    })
}
