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

var deleteNode = require('./deleteNodeAsync');
var clone = require('../utils/cloneArray');

var globalExists = function(global, callback) {
  var args;
  var result;
  var key = 'leaves:' + global;
  // does global exist?
  this.client.exists(key, function(err, result) {
    var exists = (result.toString() === '1');
    callback(exists);
  });
}


function kill(node, callback) {
  //console.log('kill: ' + JSON.stringify(node));
  var self = this;
  var global = node.global;
  if (global) {
    // does global exist?
    globalExists.call(this, global, function(exists) {
      if (!exists) {
        callback(false, {
          ok: 1,
          global: global,
          result: 0,
          subscripts: node.subscripts
        });
        return;
      }
      else {
        var subscripts = clone(node.subscripts);
        deleteNode.call(self, global, subscripts, function() {
          callback(false, {
            ok: 1,
            global: global,
            result: 0,
            subscripts: node.subscripts
          });
          return;
        });
      }
    });
  }
  else {
    callback(false, {
      ok: 0,
      global: '',
      result: 0,
      subscripts: node.subscripts || ''
    });
  }
};

module.exports = kill;
