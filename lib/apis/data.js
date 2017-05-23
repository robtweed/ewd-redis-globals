/*

 ----------------------------------------------------------------------------
 | ewd-redis-globals: Redis emulation of Global Storage database            |
 |                                                                          |
 | Copyright (c) 2016-17 M/Gateway Developments Ltd,                        |
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

  23 May 2017

*/

var flattenArray = require('../utils/flattenArray');
var redis = {
  getHProperty: require('../redis/commands/getHProperty'),
};

function data(node) {
  //console.log('data: ' + JSON.stringify(node));
  var global = node.global;
  if (global) {
    var key = 'node:' + global;
    if (!node.subscripts) node.subscripts = [];
    if (node.subscripts.length > 0) key = key + this.key_separator + flattenArray.call(this, node.subscripts);
    var result = redis.getHProperty.call(this, key, 'data');
    //console.log('** result = ' + JSON.stringify(result));
    if (typeof result !== 'undefined' && result !== null) {
      return {
        ok: 1,
        global: global,
        defined: parseInt(result),
        subscripts: node.subscripts
      };
    }
    else {
      return {
        ok: 1,
        global: global,
        defined: 0,
        subscripts: node.subscripts
      };
    }
  }
  else {
    return {ok: 0};
  }
};

module.exports = data;
