const es     = require('event-stream');
var callback = function() {
  let task = [];
  return es.through(function (file) {

        task.push(file.path);
    },
    function () { //optional 
        this.emit('end', task)
    });
};

module.exports = callback;