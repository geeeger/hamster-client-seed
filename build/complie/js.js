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
        plugins.gulp.src(task.src, {base: app.base()})
        .pipe(plugins.browserify({
            transform: plugins.babelify.configure({
                presets: ["env"],
                plugins: ["transform-runtime"],
                sourceMaps: false
            })
        }))
        .pipe(plugins.plumber(function(err){
            reject(err);
        }))
        .pipe(plugins.gulpif(
            task.condition, plugins.uglify()
        ))
        .pipe(plugins.gulpif(
            function(){
                if(task.dest){
                    return true;
                }else{
                    return false;
                }
            }, plugins.rename(task.dest), plugins.rename(function(paths){
                paths.basename = "bundle";
                paths.extname = ".js"
            })
        ))
        .pipe(plugins.addHeader())
        .pipe(plugins.gulp.dest(app.dest()))
        .pipe(plugins.callback())
        .on("end", (arr)=>{
            task.destArr = arr
            resolve(task);
        })
    })
}
