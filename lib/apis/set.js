/*

 ----------------------------------------------------------------------------
 | ewd-redis-globals: Redis emulation of Global Storage database            |
 |                                                                          |
 | Copyright (c) 2016-17 M/Gateway Developments Ltd,                        |
 | Redhill, Surrey UK.                                                      |
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

  10 February 2017

*/

var createNode = require('./createNode');
var clone = require('../utils/cloneArray');

function set(node) {
  //console.log('set: ' + JSON.stringify(node));
  var global = node.global;
  var subscripts = clone(node.subscripts);
  if (global) {
    var value = node.data;
    if (typeof value === 'undefined') value = '';
    // clean out not ASCII characters
    value = value.toString().replace(/[^\x00-\xFF]/g, "");
    createNode.call(this, global, subscripts, value);
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
      subscripts: subscripts || ''
    };
  }
};

module.exports = set;
