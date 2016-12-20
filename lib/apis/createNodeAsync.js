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

  19 December 2016

*/

var flattenArray = require('../utils/flattenArray');
var padIfInteger = require('../utils/padIfInteger');

function addParents(subscripts, roots, callback) {

  var self = this;
  var nodeRoot = roots.node;
  var childrenRoot = roots.children;
  var leavesKey = roots.leaves;

  // now go up each parent creating the
  //  intermediate nodes if the don't exist
  //  and add the child subscript to the parent's
  //  children list
  //console.log('subscripts start as ' + JSON.stringify(subscripts));

  var child = subscripts.slice(-1)[0]; // get the last subscript
  child = padIfInteger.call(this, child);
  subscripts = subscripts.slice(0, -1); // remove the last subscript
  //console.log('subscripts = ' + JSON.stringify(subscripts));
  //console.log('stop = ' + stop);
  if (subscripts.length > 0) {
    flatSubs = flattenArray.call(this, subscripts);
    nodeKey = nodeRoot + this.key_separator + flatSubs;
    childrenKey = childrenRoot + this.key_separator + flatSubs;
    //console.log('adding ' + child + ' to ' + childrenKey);
    this.client.zadd(childrenKey, 0, child, function(err, result) {
      //console.log('check if node ' + nodeKey + ' exists..');
      self.client.exists(nodeKey, function(err, result) {
        if (result.toString() !== '1') {
          self.client.hmset(nodeKey, ['data', 10], function(err, result) {
            addParents.call(self, subscripts, roots, callback)
          });
        }
        else {
          callback();
        }
      });
    });
  }
  else {
    // add child to subscripts of the global itself
    this.client.zadd(childrenRoot, 0, child, function(err, result) {
      self.client.exists(nodeRoot, function(err, result) {
        if (result.toString() !== '1') {
          self.client.hmset(nodeRoot, ['data', 10], function(err, result) {
            callback();
          });
        }
        else {
          callback();
        }
      });
    });
  }
}


function createNode(global, subscripts, value, callback) {
  var self = this;
  var noOfSubscripts = subscripts.length;
  var nodeRoot = 'node:' + global;
  var leavesKey = 'leaves:' + global;
  var childrenRoot = 'children:' + global;
  var properties;
  if (noOfSubscripts === 0) {
    // top-level global node is the leaf node
    properties = [
      'data',
      1,
      'value',
      value
    ];

    this.client.hmset(nodeRoot, properties, function(err, result) {
      callback();
    });

  }
  else {
    // subscripted node is the leaf node

    //create the leaf node

    var flatSubs = flattenArray.call(this, subscripts);
    nodeKey = nodeRoot + this.key_separator + flatSubs;
    var properties = [
      'data', 1,
      'value', value
    ];
    this.client.hmset(nodeKey, properties, function(err, result) {
      self.client.zadd(leavesKey, 0, flatSubs, function(err, result) {
        var roots = {
          node: nodeRoot,
          children: childrenRoot,
          leaves: leavesKey
        };
        addParents.call(self, subscripts, roots, callback);
      });
    });
  }
}

module.exports = createNode;
