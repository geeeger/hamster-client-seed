const { log, browser, gulp, es }      = require('./plugins.js');

const co           = require('co');

const cp           = require('child_process');

const CPU_NUM      = require('os').cpus().length;

const App          = require('./app.js');

const EventEmitter = require('events').EventEmitter;

//编译步骤： 1.获取任务  2.解析子任务  3.执行编译子任务或者家庭
//监听步骤： 1.获取任务  2.监听任务  3.获取任务  4.解析子任务  5.执行编译子任务或者家庭
class Manage extends EventEmitter {

    constructor(app, tasks){

        super();
    
        this.workers  = {};
        this.version  = app.version;
        this.count    = 0;
        this.options  = app;
        this.app      = app;
        this.action   = app.action;
        this.module   = app.module;
        this.tasks    = tasks || [];
        this.curTask  = null;
        this._Tasks   = [];
        this.total    = this.tasks.length;
        this.taskTotal= this.tasks.length;
        this.taskCount= 0;
        this.queue    = [];
        this.running  = false;
        this._spawn();        
    }

    start(){
        log("build: %s tasks", this.tasks.length);

        log("version: %s", this.version);

        log("module: %s", this.module || '*');

        if(this.tasks.length){
            switch (this.action) {
                case 'watch':
                    this.browserSync()
                    this._distributeWatch()
                    break;
                default:
                    this._distributeTask();
                    break;
            }
        }else{
            this.exit(0);
        }
    }

    task(fn){
        this._Tasks.push(fn);
    }

    getNextTask(){
        if(!this.tasks.length) return false;
        return this.tasks.shift();
    }

    getNextChildTask(){
        if(!this.queue.length) return false;
        return this.queue.shift();
    }
    

    //分配任务
    _distributeTask(){
        for (var id in this.workers) {
            if(!this.workers[id]._buildStatus && !this.running){
                this.curTask       = this.getNextTask()
                if(!this.curTask) return ;
                this.curTask.count = 0
                this.running       = true
                this.workers[id]._buildStatus = true
                this.workers[id].send(Object.assign({}, this.options, {
                    status  : 'get',
                    event   : 'get.child.task',
                    action  : this.action
                }, this.curTask));
                break;
            }
        }
    }

    _distributeChild(){
        this.eachWorker((worker)=>{
            if(!worker._buildStatus){
                let task = this.getNextChildTask();
                if(!task) return ;
                worker._buildStatus = true
                worker.send(Object.assign({}, this.options, task, {
                    status: 'complie',
                    event : 'complie.child.task',
                    action: 'complie' || this.action
                }));
            }
        });
    }

    //分配监听任务
    _distributeWatch(){
        this.eachWorker((worker)=>{

            if(!worker._buildStatus){

                let task       = this.getNextTask()
                if(!task) return ;

                worker._buildStatus = true

                worker.send(Object.assign({}, this.options, task, {
                    status: 'watch',
                    event : 'watch.child.task',
                    action: this.action
                }));
            }
        });
    }

    finish(message){
        if(message.event == 'error'){
            let error = '';
            switch (Object.prototype.toString.call(message.error)) {
                case '[object Error]':
                    if (message.error.stack) {
                        error = message.error.stack;
                    }
                    else {
                        error = message.error.message;
                    }
                    break;
                case '[object Object]':
                    error = JSON.stringify(message.error);
                    break;
                default:
                    error = message.error;
                    break;
            }
            log("worker(%s) error: %s", message.workerid, error);
            return this.exit(1);
        }
        switch (message.event) {
            case 'get.child.task':
                this.queue = this.queue.concat(message.childTasks);
                this.count++;
                this.curTask.count = 0;
                this.curTask.total = message.childTasks.length;
                log("worker(%s) start task(%s): %s child tasks", message.workerid, this.count, this.curTask.total);
                if(this.curTask.total){
                    this._distributeChild();
                }else{
                    this.end();
                    this.running = false
                    this._distributeTask();
                }
                break;
            case 'watch.child.task':
                this.count++;
                log("worker(%s) watch task(%s)", message.workerid, this.count);
                this._distributeWatch();
                break;
            case 'add.child.task':
                this.tasks.push(new ChildTask(message));
                log("worker(%s) add task", message.workerid);
                this._distributeTask();
                break;
            case 'complie.child.task':
                this.curTask.count++; 
                this._watchReload(message);
                if(this.curTask.count === this.curTask.total){
                    log("worker(%s) finish task(%s)", message.workerid, this.count);
                    this.end();
                    this.running = false
                    this._distributeTask();
                }else{
                    this._distributeChild();
                }
            default:
                
                break;
        }
    }

    spawn(i){

        this.workers[i] = cp.fork('./build/common/run.js');

        this.workers[i].on('exit', (code, signal) => {
            log("child("+ i +") exit: %s", code);
            this.exit(1);
        });

        this.workers[i].on('message', (message) => {
            this.workers[i]._buildStatus = false;
            this.finish(Object.assign(message, {
                worker  : this.workers[i],
                workerid: i
            }));
        });

        this.workers[i].on('error', (error) => {
            log("error: %s", new Error("child("+ i +") "+ error));
            this.exit(1);
        });

        process.on('exit', (code, signal) => {
            this.exit(code);
        });
    }

    eachWorker(callback) {
        for (var id in this.workers) {
            callback(this.workers[id]);
        }
    }

    exit(code){
        this.eachWorker((worker)=>{
            worker.kill();
        });
        if(code === 0){
            this.emit('finish', code);
        }
        process.exit(code);
    }

    end(){
        if(this.count == this.total && this.action != 'watch' && !this.queue.length){
            this.exit(0)
        }
    }

    _spawn(){
        for (var i = 0; i < CPU_NUM; i++) {
            this.spawn(i);
        }
    }

    browserSync(){
        if(this.action != 'watch' || this.browser){
            return ;
        }
        this.browser = browser

        this._browser();
    }

    _browser(){
        this.browser.init({
            port: 3000,
            proxy: "http://localhost:8361"
        });
    }

    _watchReload(task){
        if(this.action == 'watch'){
            switch(task.type){
                case 'css': 
                    gulp.src(task.destArr)
                    .pipe(this.browser.reload({stream: true}));
                    break; 
                default: 
                    this.browser.reload();
            }
        }
    }
}

module.exports = Manage;


class Task extends EventEmitter {
    constructor(task){
        super()
        Object.assign(this, task);
    }

    parseChildTask(){
        return co(this._parseChildTask(this, new App({
            module   : this.module,
            version  : this.version,
            condition: this.condition,
            action   : this.action,
            root     : this.root
        })))
    }

    * _parseChildTask(task, app){
    
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
                })
            })())
            .on("end", function(ts){
                if(task.dest){
                    task.src = ts
                    childTasks.push(Object.assign({}, task))
                }
                resolve(childTasks);
            })
            .on("error", function(err){
                reject(err);
            });
        })
    }
}

function eachWorker(callback) {
    for (var id in workers) {
        callback(workers[id]);
    }
}

function _spawn(){
    for (var i = 0; i < CPU_NUM; i++) {
        spawn(i);
    }
}

class ChildTask extends EventEmitter {
    constructor(task){
        super()
        this.module    = task.module || '*';
        this.root      = task.root
        this.condition = task.condition || false;
        this.views     = task.views;
        this.action    = task.action;
        this.version   = task.version || 'dev';
        this.status    = task.status || 'start';
        this.type      = task.type;
        this.src       = task.src || [];
        this.dest      = task.dest || null;
        this.destArr   = task.destArr || [];
    }
    _run(){
    
    }
   
}
