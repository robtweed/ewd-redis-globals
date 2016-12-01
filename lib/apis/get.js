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
  getHProperties: require('../redis/commands/getHProperties'),
};

function get(node) {
  //console.log('get: ' + JSON.stringify(node));
  var global = node.global;
  if (global) {
    var key = 'node:' + global;
    if (!node.subscripts) node.subscripts = [];
    var subscripts = clone(node.subscripts);
    if (subscripts.length > 0) key = key + this.key_separator + flattenArray.call(this, subscripts);
    var result = redis.getHProperties.call(this, key);
    //console.log('** redisGetHProperties result = ' + JSON.stringify(result));
    if (result.data) {
      var value = result.value;
      return {
        ok: 1,
        global: global,
        data: value || '',
        defined: parseInt(result.data),
        subscripts: node.subscripts
      };
    }
    else {
      return {
        ok: 1,
        global: global,
        data: '',
        defined: 0,
        subscripts: node.subscripts
      };
    }
  }
  else {
    return {ok: 0};
  }
};

module.exports = get;
