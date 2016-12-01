var redis_globals = require('ewd-redis-globals');

// instantiate using default

// eg Redis at localhost:6379
//  and assumes Node v 6.x on Linux

var db = new redis_globals();

db.open();

console.log(db.version());

var node = {
  global: 'rob'
};

var result = db.kill(node);
console.log('kill: ' + JSON.stringify(result));

var node = {
  global: 'rob',
  subscripts: ['a', 'b'],
  data: 'hello'
};

db.set(node);

node = {
  global: 'rob',
  subscripts: ['a', 'c'],
  data: 1
};

db.set(node);

node = {
  global: 'rob',
  subscripts: ['b', 'd'],
  data: 'bar'
};

db.set(node);

node = {
  global: 'rob',
  subscripts: ['a', 'd', 'x'],
  data: 'xnode'
};
db.set(node);

node = {
  global: 'rob',
  subscripts: ['a', 'd', 'y'],
  data: 'ynode'
};
db.set(node);

console.log('get: ' + JSON.stringify(db.get(node), null, 2));
console.log('data: ' + JSON.stringify(db.data(node), null, 2));

node = {
  global: 'rob',
  subscripts: ['a'],
};

console.log('get: ' + JSON.stringify(db.get(node), null, 2));
console.log('data: ' + JSON.stringify(db.data(node), null, 2));

node = {
  global: 'rob',
  subscripts: [],
};

console.log('get: ' + JSON.stringify(db.get(node), null, 2));
console.log('data: ' + JSON.stringify(db.data(node), null, 2));

node = {
  global: 'rob',
  subscripts: ['x', 'y'],
};

console.log('get: ' + JSON.stringify(db.get(node), null, 2));
console.log('data: ' + JSON.stringify(db.data(node), null, 2));

console.log('------- increment tests ------');

node = {
  global: 'rob',
  subscripts: ['a', 'c'],
};

console.log('increment: ' + JSON.stringify(db.increment(node), null, 2));
console.log('get: ' + JSON.stringify(db.get(node), null, 2));

node = {
  global: 'rob',
  subscripts: ['a', 'c'],
  increment: 3
};

console.log('increment: ' + JSON.stringify(db.increment(node), null, 2));
console.log('get: ' + JSON.stringify(db.get(node), null, 2));


// ============
node = {
  global: 'rob',
  subscripts: ['a'],
};

//var result = db.kill(node);
//console.log('kill: ' + JSON.stringify(result));

console.log('------- next tests ------');

node = {
  global: 'rob',
  subscripts: ['']
};
console.log('---');
console.log('seed: ' + JSON.stringify(node));
node = db.next(node);
console.log('** next: ' + JSON.stringify(node));

node = {
  global: 'rob',
  subscripts: ['a', '']
};
console.log('---');
console.log('seed: ' + JSON.stringify(node));
node = db.next(node);
console.log('next: ' + JSON.stringify(node));

console.log('---');
console.log('seed: ' + JSON.stringify(node));
node = db.next(node);
console.log('next: ' + JSON.stringify(node));

console.log('---');
console.log('seed: ' + JSON.stringify(node));
node = db.next(node);
console.log('next: ' + JSON.stringify(node));

console.log('---');
console.log('seed: ' + JSON.stringify(node));
var result = db.next(node);
console.log('next: ' + JSON.stringify(result));


node = {
  global: 'rob',
  subscripts: ['a', 'blimey']
};
console.log('---');
console.log('seed: ' + JSON.stringify(node));
node = db.next(node);
console.log('next: ' + JSON.stringify(node));

// previous

console.log('------- previous tests ------');

node = {
  global: 'rob',
  subscripts: ['a', '']
};

console.log('---');
console.log('seed: ' + JSON.stringify(node));
node = db.previous(node);
console.log('previous: ' + JSON.stringify(node));

console.log('---');
console.log('seed: ' + JSON.stringify(node));
var node = db.previous(node);
console.log('previous: ' + JSON.stringify(node));

console.log('---');
console.log('seed: ' + JSON.stringify(node));
var node = db.previous(node);
console.log('previous: ' + JSON.stringify(node));

console.log('---');
console.log('seed: ' + JSON.stringify(node));
var result = db.previous(node);
console.log('previous: ' + JSON.stringify(result));

node = {
  global: 'rob',
  subscripts: ['a', 'blimey']
};
console.log('---');
console.log('seed: ' + JSON.stringify(node));
node = db.previous(node);
console.log('previous: ' + JSON.stringify(node));


node = {
  global: 'rob',
  subscripts: ['a'],
};

//var result = db.kill(node);
//console.log('kill: ' + JSON.stringify(result));

console.log('------- global directory ------');

console.log('Global directory: ' + JSON.stringify(db.global_directory()));

// next_node

console.log('---- next_node tests -------');

node = {
  global: 'rob',
};
console.log('seed node: ' + JSON.stringify(node));
node = db.next_node(node);
console.log('next_node: ' + JSON.stringify(node));

console.log('---');
console.log('seed node: ' + JSON.stringify(node));
node = db.next_node(node);
console.log('next_node: ' + JSON.stringify(node));

console.log('---');
console.log('seed node: ' + JSON.stringify(node));
node = db.next_node(node);
console.log('next_node: ' + JSON.stringify(node));

console.log('---');
console.log('seed node: ' + JSON.stringify(node));
node = db.next_node(node);
console.log('next_node: ' + JSON.stringify(node));

console.log('---');
console.log('seed node: ' + JSON.stringify(node));
node = db.next_node(node);
console.log('next_node: ' + JSON.stringify(node));

console.log('---');
node = {
  global: 'robx',
};
console.log('seed node: ' + JSON.stringify(node));
node = db.next_node(node);
console.log('next_node: ' + JSON.stringify(node));

console.log('---');
node = {
  global: 'rob',
  subscripts: ['ab']
};
console.log('seed node: ' + JSON.stringify(node));
node = db.next_node(node);
console.log('next_node: ' + JSON.stringify(node));


db.close();
