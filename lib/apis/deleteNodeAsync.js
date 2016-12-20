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


function deleteMatchingZMembers(key, fromValue, toValue, callback) {
  var args = [key, '[' + fromValue, '(' + toValue + '~~'];
  this.client.zremrangebylex(args, function(err, result) {
    callback(result);
  });
}

function deleteZMembersByPrefix(key, prefixValue, callback) {
  deleteMatchingZMembers.call(this, key, prefixValue, prefixValue, callback);
}

function deleteParents(subscripts, roots, callback) {

  var self = this;
  var nodeRoot = roots.node;
  var childrenRoot = roots.children;
  var leavesKey = roots.leaves;
  var nodeKey;
  var childrenKey;

  var child = subscripts.slice(-1)[0]; // get the last subscript
  child = padIfInteger.call(this, child);
  subscripts = subscripts.slice(0, -1); // remove the last subscript
  //console.log('subscripts = ' + JSON.stringify(subscripts));

  if (subscripts.length > 0) {
    //console.log('subscripts length: ' + subscripts.length);
    var flatSubs = flattenArray.call(this, subscripts);
    childrenKey = childrenRoot + this.key_separator + flatSubs;
    //console.log('remove childrenKey = ' + childrenKey + '; child = ' + child);
    this.client.zrem(childrenKey, child, function(err, result) {
      // we're still in a subscripted level
      self.client.zcard(childrenKey, function(err, result) {
        if (result === 0) {
          //console.log('no more children left for ' + childrenKey);
          // no children left, so delete the node and recurse up a level
          nodeKey = nodeRoot + self.key_separator + flatSubs;
          //console.log('delete ' + nodeKey);
          self.client.del(nodeKey, function(err, result) {
            deleteParents.call(self, subscripts, roots, callback);
          });
        }
        else {
          //console.log(childrenKey + ' still has children');
          // parent still has other children, so stop the recursion up the parents
          callback();
        }
      });
    });
  }

  else {
    //console.log('check the global node itself');
    // we need to check the subscripts against the global node itself
    //console.log('global level - remove ' + child + ' from ' + childrenRoot);
    this.client.zrem(childrenRoot, child, function(err, result) {
      //console.log('check top level childrenRoot = ' + childrenRoot);
      self.client.zcard(childrenRoot, function(err, result) {
        if (result === 0) {
          // no children left, so delete the node
          //console.log('global node has no children so delete ' + nodeRoot);
          self.client.del(nodeRoot, function(err, result) {
            // at the top now, so stop
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

function deleteNode(global, subscripts, callback) {
  var self = this;
  var keys;
  var args;
  var result;
  if (subscripts.length === 0) {
    // top level delete of entire global
    keys = ['node:' + global, 'leaves:' + global, 'children:' + global];
    this.client.keys('*' + global + this.key_separator + '*', function(err, result) {
      self.client.del(keys.concat(result), function(err, result) {
        callback();
      });
    });
  }
  else {
    var nodeRoot = 'node:' + global;
    var childrenRoot = 'children:' + global;
    var leafKey = 'leaves:' + global;
    var roots = {
      node: nodeRoot,
      children: childrenRoot,
      leaf: leafKey
    }
    var nodeKey;
    var childrenKey;
    var keys;
     // delete everything from the specified subscripts and below
    var flatSubs = flattenArray.call(this, subscripts);
    nodeKey = nodeRoot + this.key_separator + flatSubs;
    childrenKey = childrenRoot + this.key_separator + flatSubs;
    keys = [nodeKey, childrenKey];

    // match all lower-level nodes and children
    var wildcard = '*' + global + this.key_separator + flatSubs + this.key_separator + '*';
    this.client.keys(wildcard, function(err, result) {
      self.client.del(keys.concat(result), function(err, result) {
        // now remove leaf item records
        //  match all the lower-level leaf nodes that start with the specified flattened subscripts
        deleteZMembersByPrefix.call(self, leafKey, flatSubs + this.key_separator, function(result) {

          // and now remove the leaf node specified in the delete
          self.client.zrem(leafKey, flatSubs, function(err, result) {

            // now recursively remove each subscript level from next level up's children

            // if there aren't any subscripts left in the parent, this should be deleted
            //  and recurse this logic up all parent levels

            deleteParents.call(self, subscripts, roots, callback);
          });
        });
      });
    });
  }
}

module.exports = deleteNode;
