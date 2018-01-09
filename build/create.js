var program = require('commander');
var fs = require('fs-extra');
program
.version('0.0.1')
.option('-v, --ver <ver>', 'The Build Version')

program
.command('i <app>')
.description('创建一个新项目')
.action(function(app) {
    if (!app) {
        console.error('no app name');
        return;
    }
    try {
        console.log('create src');
        fs.copySync('./build/template/src', './src/' + app);
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('create static');
        fs.copySync('./build/template/static', './static/' + app);
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('set build.task.js');
        fs.writeFileSync('./static/' + app + '/index/build.task.js',
            fs.readFileSync('./static/' + app + '/index/build.task.js', 'utf-8').replace(/\${app}/g, app)
        );
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('set index/index.pug');
        fs.writeFileSync('./static/' + app + '/index/index.pug',
            fs.readFileSync('./static/' + app + '/index/index.pug', 'utf-8').replace(/\${app}/g, app)
        );
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('set index/package.json');
        fs.writeFileSync('./static/' + app + '/index/package.json',
            fs.readFileSync('./static/' + app + '/index/package.json', 'utf-8').replace(/\${app}/g, app)
        );
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
});

program
.command('s <app> [subapp]')
.description('创建一个子项目')
.action(function(app, subapp) {
    if (!app) {
        console.error('no app name');
        return;
    }
    if (!subapp) {
        console.error('no subapp name');
        return;
    }
    try {
        console.log('create controller');
        fs.copySync('./build/template/src/controller/index.js', './src/' + app + '/controller/' + subapp + '.js');
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('create static');
        fs.copySync('./build/template/static/index', './static/' + app + '/' + subapp);
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('set ' + subapp + '/index.pug');
        fs.writeFileSync('./static/' + app + '/' + subapp + '/index.pug',
            fs.readFileSync('./static/' + app + '/' + subapp + '/index.pug', 'utf-8').replace(/\${app}\/index/g, app + '/' + subapp)
        );
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('set build.task.js');
        fs.writeFileSync('./static/' + app + '/' + subapp + '/build.task.js',
            fs.readFileSync('./static/' + app + '/' + subapp + '/build.task.js', 'utf-8').replace(/\${app}\/index/g, app + '/' + subapp)
        );
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
    try {
        console.log('set ' + subapp + '/package.json');
        fs.writeFileSync('./static/' + app + '/' + subapp + '/package.json',
            fs.readFileSync('./static/' + app + '/' + subapp + '/package.json', 'utf-8').replace(/\${app}\.index/g, app + '.' + subapp)
        );
        console.log('success!');
    } catch (e) {
        console.log(e)
    }
})

program.parse(process.argv);