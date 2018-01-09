let   build  = require("./build.js");

const co     = require('co');

let argv     = process.argv.slice(2)
try{
co(build({
    command: argv[0] || 'dev',

    module : argv[1] || '*',

    version: argv[2]

})).catch((err)=>{
    console.log(err);
    process.exit(1);
})
}
catch(e) {
    console.log(e)
}
