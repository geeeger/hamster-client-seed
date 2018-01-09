module.exports = function (opts = {}, app) {
  return function (ctx, next) {
    ctx.set({
      'X-Powered-By': ctx.config('X-Powered-By')
    });  
    return next();
  };
};