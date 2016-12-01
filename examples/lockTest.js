var redis_globals = require('ewd-redis-globals');

// instantiate using default

// eg Redis at localhost:6379
//  and assumes Node v 6.x on Linux

var db = new redis_globals();

db.open();

console.log(db.version());

var timeout = 40;

var node = {
  global: 'rob',
  subscripts: ['a'],
  timeout: timeout
};

console.log('attempting to lock ' + JSON.stringify(node) + ' within ' + timeout + ' seconds');
var ok = db.lock(node);

if (ok.result === 0) {
  console.log('lock timed out: ' + JSON.stringify(ok));
  db.close();
}
else {
  console.log('lock set: ' + JSON.stringify(ok));
  console.log('will release in 30 seconds');
  setTimeout(function() {
    var result = db.unlock(node);
    console.log('unlocked: ' + JSON.stringify(result));
    db.close();
  }, 30000);
}