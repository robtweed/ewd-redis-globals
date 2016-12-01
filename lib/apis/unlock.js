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
  getKeyValue: require('../redis/commands/getKeyValue'),
  deleteKey: require('../redis/commands/deleteKey'),
  pushOntoList: require('../redis/commands/pushOntoList'),
};

function unlock(node) {
  if (!node.global) return {ok: 0};
  // key that will be used to block
  var global = node.global;
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
  if (!redis.keyExists.call(this, lockerKey)) {
    // nobody has this lock set, so just return
    return {
      ok: 1,
      global: global,
      subscripts: node.subscripts,
      result: 0
    };
  }
  else {
    // if I have the lock, unlock it by pushing a value onto the lock list
    var result = redis.getKeyValue.call(this, lockerKey);
    if (result.toString() === process.pid.toString()) {
      //console.log("I own the lock so I'll unlock it");
      //console.log('push value onto ' + lockKey);
      //console.log('first delete ' + lockerKey);
      redis.deleteKey.call(this, lockerKey);
      redis.pushOntoList.call(this, lockKey, 'unlocked by ' + process.pid);
      //return {ok: true, releasedBy: process.pid};
      return {
        ok: 1,
        global: global,
        subscripts: node.subscripts,
        result: 0,
        releasedBy: process.pid
      };
    }
    else {
      // I don't own the lock so I can't release it
      return {
        ok: 1,
        global: global,
        subscripts: node.subscripts,
        result: 0
      };
    }
  }
};

module.exports = unlock;
