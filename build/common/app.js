const { log, path }    = require('./plugins.js');
class app {
    constructor(options){

        this.options   = options;

        this.module    = options.module    || '';

        this.root      = options.root      || '';

        this.condition = options.condition || false;

        this.action    = options.action    || 'complie';

        this.version   = options.version   || 'dev';

        this.views     = options.views;

        this.staticFolder = options.staticFolder  || 'static';

        this.viewFolder   = options.viewFolder    || 'view';

        this.taskFolder   = options.taskFolder    || 'build/task';

        this.destFolder   = options.destFolder    || 'www/static';

    }

    task (arr){
        let res = [
            path.join(this.root, this.staticFolder, this.module === '*' ? '' : this.module, '**/*.task.js'),
            path.join(this.root, this.staticFolder, this.module === '*' ? '' : this.module, '**/build.json')
        ];

        if(!arr) return res;

        if(!Array.isArray(arr)){
            arr = [arr];
        }
        arr.forEach( (v) => {
            if(/^!/.test(v)){
                res.push(path.join(
                    '!',
                    this.root, 
                    this.taskFolder,
                    this.module === '*' ? '' : this.module,
                    v.replace(/(^!)/, '')
                ));
            }else{
                res.push(path.join(
                    this.root, 
                    this.taskFolder,
                    this.module === '*' ? '' : this.module,
                    v
                ));
            }   
        });
        return res;
    }
        
    src (arr, type = ''){
        if(!Array.isArray(arr)){
            arr = [arr];
        }
        let res = [];
        arr.forEach( (v) => {
            if(/^!/.test(v)){
                res.push(path.join(
                    '!',
                    this.root, 
                    this.staticFolder,
                    type,
                    v.replace(/(^!)/, '')
                ));
            }else{
                let reg = v.match(/(.*):(.*)/i);
                if(reg && !reg){
                    res.push(path.join(
                        this.root, 
                        this.staticFolder,
                        type,
                        reg[2] ? reg[2] : v
                    ));
                }else{
                    res.push(path.join(
                        this.root, 
                        this.staticFolder,
                        type,
                        v
                    ));
                }
                
            }   
        });
        return res;
    }
    base (v, m = false){
        v = v || '';
        return [
            this.root, 
            this.staticFolder,
            v
        ].join('/');
    }

    vbase (m = '', v = ''){
        return [
            this.root, 
            this.staticFolder,
            m,
            v
        ].join('/');
    }

    tbase (v){
        v = v || '';
        return [
            this.root, 
            this.taskFolder,
            v
        ].join('/');
    }

    dest (v, type = 'static', folder = 'www', m = false, version = true){
        v = v || '';
        return [
            this.root,
            this.destFolder,
            version ? this.version : '',
            v
        ].join('/');
    }

    vdest (v, m = false, version = false){
        v = v || '';
        return [
            this.root,
            this.viewFolder,
            version ? this.version : '',
            m !== false || this.module === '*' ? '' : this.module,
            v
        ].join('/'); 
    }

    viewdest (v, type = 'static', folder = 'www'){
        v = v || '';
        return [
            this.root,
            folder,
            type,
            this.version,
            v
        ].join('/');
    }

    eslintError (results, type){
        type = type || 'error';
        log(`ESLint result: ${results.filePath}`);
        log(`# Messages: ${results.messages.length}`);
        log(`# Warnings: ${results.warningCount}`);
        log(`# Errors: ${results.errorCount}`);
        results.messages.map(function(result){
            log(result);
        });
    }
}

module.exports = app;
