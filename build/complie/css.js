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
    if(task.dest && plugins.path.basename(task.dest)){
        return new Promise(function(resolve, reject) {
            plugins.gulp.src(task.src, {base: app.base()})
            .pipe(plugins.plumber(function(err){
                reject(err);
            }))
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.autoprefixer({
                browsers: ['last 2 versions', 'android >= 4.0', 'ios >= 8'],
                cascade: false,
                remove: false
            }))
            .pipe(plugins.gulpif(
                ()=>{
                    return task.condition
                }, plugins.minifyCss({
                    compatibility: 'ie7'
                })
            ))
            .pipe(plugins.concat(plugins.path.basename(task.dest)))
            .pipe(plugins.addHeader('@charset "utf-8";'))
            .pipe(plugins.gulp.dest(app.dest(plugins.path.dirname(task.dest))))
            .pipe(plugins.callback())
            .on("end", (arr)=>{
                task.destArr = arr
                resolve(task);
            })
            // .pipe(app.reload({stream:true}))
        })
    }
    return new Promise(function(resolve, reject) {
        plugins.gulp.src(task.src, {base: app.base()})
        .pipe(plugins.plumber(function(err){
            reject(err);
        }))
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'android >= 4.0', 'ios >= 8'],
            cascade: false,
            remove: false
        }))
        .pipe(plugins.gulpif(
            ()=>{
                return task.condition
            }, plugins.minifyCss({
                compatibility: 'ie7'
            })
        ))
        .pipe(plugins.addHeader('@charset "utf-8";'))
        .pipe(plugins.gulp.dest(app.dest()))
        .pipe(plugins.callback())
        .on("end", (arr)=>{
            task.destArr = arr
            resolve(task);
        })
    })
}
