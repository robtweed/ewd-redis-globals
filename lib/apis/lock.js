/*

 ----------------------------------------------------------------------------
 | ewd-redis-globals: Redis emulation of Global Storage database            |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  1 December 2016

*/

var clone = require('../utils/cloneArray');
var flattenArray = require('../utils/flattenArray');

var redis = {
  keyExists: require('../redis/commands/keyExists'),
  setKeyValue: require('../redis/commands/setKeyValue'),
  deleteKey: require('../redis/commands/deleteKey'),
  blockingPop: require('../redis/commands/blockingPop'),
};

function lock(node) {
  if (!node.global) return {ok: 0};
  var global = node.global;
  // key that will be used to block
  var lockKey = 'lock:' + global;
  // key that denotes who's got the lock
  var lockerKey = 'locker:' + global;
  if (!node.subscripts) node.subscripts = [];
  var subscripts = clone(node.subscripts);
  if (subscripts.length > 0) {
    var flatSubs = flattenArray.call(this, subscripts);
    lockKey = lockKey + this.key_separator + flatSubs;
    lockerKey = lockerKey + this.key_separator + flatSubs;
  }
  //console.log('checking if lockerKey ' + lockerKey + ' exists');
  if (!redis.keyExists.call(this, lockerKey)) {
    //console.log('lockerKey does not exist');
    // nobody has this lock set, so grab it and clear out the lock key
    redis.setKeyValue.call(this, lockerKey, process.pid);
    redis.deleteKey.call(this, lockKey);
    return {
      ok: 1,
      global: global,
      subscripts: node.subscripts,
      result: 1,
      pid: process.pid
    };
  }
  else {
    //console.log('locker key exists');
    // block awaiting the lock to be unlocked
    //console.log('waiting on lock for ' + node.timeout + ' seconds');
    var result = redis.blockingPop.call(this, lockKey, node.timeout);
    //console.log('blocking pop completed: ' + JSON.stringify(result));
    if (result.error) {
      // lock timed out
      return {
        ok: 1,
        global: global,
        subscripts: node.subscripts,
        result: 0
      };
    }
    else {
      // I now have the lock
      //console.log('i now have the lock.  lockerKey ' + lockerKey + ' set to ' + process.pid);
      redis.setKeyValue.call(this, lockerKey, process.pid);
      return {
        ok: 1,
        global: global,
        subscripts: node.subscripts,
        result: 1,
        pid: process.pid
      };
    }
  }
};

module.exports = lock;
