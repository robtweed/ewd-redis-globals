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

var deleteNode = require('./deleteNode');
var clone = require('../utils/cloneArray');
var globalExists = require('../redis/commands/globalExists');


function kill(node) {
  //console.log('kill: ' + JSON.stringify(node));
  var global = node.global;
  if (global) {
    // does global exist?
    if (!globalExists.call(this, global)) {
      return {
        ok: 1,
        global: global,
        result: 0,
        subscripts: node.subscripts
      };
    }

    var subscripts = clone(node.subscripts);

    deleteNode.call(this, global, subscripts);
    return {
      ok: 1,
      global: global,
      result: 0,
      subscripts: node.subscripts
    };
  }
  else {
    return {
      ok: 0,
      global: '',
      result: 0,
      subscripts: node.subscripts || ''
    };
  }
};

module.exports = kill;
