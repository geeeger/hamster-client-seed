const EventEmitter = require('events').EventEmitter;

class Complie extends EventEmitter {

    constructor(app, task, plugins){
        super();
        complie(app, task, plugins).then((message)=>{
            this.emit("message", message);
        }).catch((err)=>{
            this.emit("error", err);
        });
        return this;
    }
}

module.exports = function(app, task, plugins){
    return new Complie(app, task, plugins);
}

function complie(app, task, plugins){
    return new Promise(function(resolve, reject) {
            plugins.gulp.src(task.src, {base: app.vbase(task.module, task.views === false ? '' : 'views')})
            .pipe(plugins.plumber(function(err){
                reject(err);
            }))
            .pipe(plugins.gulp.dest(app.vdest()))
            .pipe(plugins.callback())
            .on("end", (arr)=>{
                task.destArr = arr
                resolve(task);
            })
        })
}
