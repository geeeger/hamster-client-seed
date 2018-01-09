const version  = require('./common/version.js');

const { log } = require('./common/plugins.js');

const path = require('path');

let   Apps     = require('./common/app.js');

let   Task     = require('./common/task.js');

let   Manage   = require('./common/manage.js');

let   condition= false;

let   config   = {
    module     : '*',
    condition  : condition,
    action     : 'complie',
    root       : path.dirname(__dirname)
}

let  workers   = {}

module.exports = function* (options){

    config     = Object.assign(config, options)

    config.condition = config.command == 'build' ? true    : false;

    config.action    = config.command == 'watch' ? 'watch' : 'complie';

    let app    = new Apps(config)
    
    //版本号
    let v      = yield version(app)

    if(v instanceof Error){
        log(v);
        process.exit(1);
    }

    app.version = v;
    //任务json
    let tasks  = yield Task(app)

    if(tasks instanceof Error){
        log(v);
        process.exit(1);
    }

    let m = new Manage(app, tasks);

    m.start();

    m.on("exit", (code)=>{
        process.exit(code);
    })

    m.on("error", (err)=>{
        log(err);
        process.exit(1);
    })
}

