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

function increment(node) {
  //console.log('increment: ' + JSON.stringify(node));
  var global = node.global;
  if (global) {
    var by = node.increment || 1;
    var currentValue = this.get(node).data;
    if (currentValue === '') currentValue = 0;
    node.data = parseInt(currentValue) + parseInt(by);
    var result = this.set(node);      
    return {
      ok: 1,
      global: global,
      data: node.data,
      subscripts: node.subscripts
    };
  }
  else {
    return {ok: 0};
  }
};

module.exports = increment;
