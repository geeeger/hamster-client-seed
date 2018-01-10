const css     = require('../complie/css');
const js      = require('../complie/js');
const third   = require('../complie/third');
const res     = require('../complie/res');
const views   = require('../complie/views');
const App     = require('./app.js');
const plugins = require('./plugins.js');
const co      = require('co');
const { log, watchs, gulp, es, lodash, eslint } = plugins;


const EventEmitter = require('events').EventEmitter;

process.on('message', function(task) {
    switch(task.event){
        case 'get.child.task':
            co(parseChildTask(task, new App({
                module   : task.module,
                version  : task.version,
                condition: task.condition,
                event    : task.event,
                action   : task.action,
                views    : task.views,
                root     : task.root
            }))).catch((err)=>{
                task.event  = 'error'
                task.error   = "Parse Child Task: "+ err.stack
                process.send(task)
            }).then((childTasks)=>{
                task.childTasks = childTasks
                process.send(task)
            })
            break;
        case 'watch.child.task':
            process.send(task)
            watchTask(task, new App({
                module   : task.module,
                version  : task.version,
                condition: task.condition,
                action   : task.action,
                event    : task.event,
                views    : task.views,
                root     : task.root
            }), function(t){
                t.event = 'add.child.task'
                process.send(t)
            })
            break;
        case 'complie.child.task':
            let run = null;
            switch (task.type) {
                case 'css':
                    run = css
                    break;
                case 'js':
                    run = js
                    break;
                case 'third':
                    run = third
                    break;
                case 'res':
                    run = res
                    break;
                case 'views':
                    run = views
                    break;
                default:
                    run = res
                    break;
            }
            if(!run){
                task.event  = 'error'
                process.send(task)
                return ;
            }
            run(new App({
                module   : task.module,
                version  : task.version,
                condition: task.condition,
                event    : task.event,
                action   : task.action,
                views    : task.views,
                root     : task.root
            }), task, plugins)
            .on("message", (task)=>{
                process.send(task)
            })
            .on("error", (err)=>{
                task.event  = 'error'
                task.error  = err.stack
                process.send(task)
            })
            break;
    }
});

function watchTask(task, app, callback){
    watchs(app.src(
        lodash.merge(
            [],
            ['!**/node_modules/**/*'],
            task.src,
            task.watch
        )
    ), {read: false}, (file)=> {
        callback(task);
        // lint
        if (task.type === 'js' && !task.condition) {
            try{
                gulp.src([file.path])
                    .pipe(eslint())
                    .pipe(eslint.format())
            }
            catch(e) {
                console.log(e)
            }
        }
    });
}


function* parseChildTask(task, app){
    
    let childTasks = [];

    return yield new Promise(function(resolve, reject){
        gulp.src(app.src(task.src), {read: false})
        .pipe((function(){
            let ts = [];
            return es.through(function (file) {
                if(task.dest){
                    ts.push(file.path);
                }else{
                    task.src = [file.path]
                    childTasks.push(Object.assign({}, task))
                }
            },
            function () {
                this.emit('end', ts)
            });
        })())
        .on("end", function(ts){
            if(task.dest){
                task.src = ts;
                childTasks.push(Object.assign({}, task));
            }
            resolve(childTasks);
        })
        .on("error", function(err){
            reject(err);
        });
    });
}