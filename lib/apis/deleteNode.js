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

var flattenArray = require('../utils/flattenArray');
var padIfInteger = require('../utils/padIfInteger');

var redis = {
  getMatchingKeys: require('../redis/commands/getMatchingKeys'),
  deleteKey: require('../redis/commands/deleteKey'),
  deleteKeys: require('../redis/commands/deleteKeys'),
  deleteZMembersByPrefix: require('../redis/commands/deleteZMembersByPrefix'),
  deleteZMember: require('../redis/commands/deleteZMember'),
  countZMembers: require('../redis/commands/countZMembers'),
  keyExists: require('../redis/commands/keyExists')
};

function deleteNode(global, subscripts) {
  var keys;
  var args;
  var result;
  if (subscripts.length === 0) {
    // top level delete of entire global
    keys = ['node:' + global, 'leaves:' + global, 'children:' + global];
    result = redis.getMatchingKeys.call(this, '*' + global + this.key_separator + '*');
    redis.deleteKeys.call(this, keys.concat(result));
  }
  else {
    var nodeRoot = 'node:' + global;
    var childrenRoot = 'children:' + global;
    var leafKey = 'leaves:' + global;
    var nodeKey;
    var childrenKey;
    var keys;
     // delete everything from the specified subscripts and below
    var flatSubs = flattenArray.call(this, subscripts);
    nodeKey = nodeRoot + this.key_separator + flatSubs;
    childrenKey = childrenRoot + this.key_separator + flatSubs;
    keys = [nodeKey, childrenKey];

    // match all lower-level nodes and children
    var wildCard = '*' + global + this.key_separator + flatSubs + this.key_separator + '*';
    result = redis.getMatchingKeys.call(this, wildCard);
    // now delete all these keys
    result = redis.deleteKeys.call(this, keys.concat(result))
    // now remove leaf item records
    //  match all the lower-level leaf nodes that start with the specified flattened subscripts
    redis.deleteZMembersByPrefix.call(this, leafKey, flatSubs + this.key_separator);

    // and now remove the leaf node specified in the delete
    redis.deleteZMember.call(this, leafKey, flatSubs);  // change to deleteZMember

    // now recursively remove each subscript level from next level up's children

    // if there aren't any subscripts left in the parent, this should be deleted
    //  and recurse this logic up all parent levels

    var stop = false;
    do {
      child = subscripts.slice(-1)[0]; // get the last subscript
      child = padIfInteger.call(this, child);
      subscripts = subscripts.slice(0, -1); // remove the last subscript
      //console.log('subscripts = ' + JSON.stringify(subscripts));

      if (subscripts.length > 0) {
        //console.log('subscripts length: ' + subscripts.length);
        flatSubs = flattenArray.call(this, subscripts);
        childrenKey = childrenRoot + this.key_separator + flatSubs;
        //console.log('remove childrenKey = ' + childrenKey + '; child = ' + child);
        redis.deleteZMember.call(this, childrenKey, child);

        // we're still in a subscripted level

        if (redis.countZMembers.call(this, childrenKey) === 0) {
          //console.log('no more children left for ' + childrenKey);
          // no children left, so delete the node and recurse up a level
          nodeKey = nodeRoot + this.key_separator + flatSubs;
          //console.log('delete ' + nodeKey);
          redis.deleteKey.call(this, nodeKey);
        }
        else {
          //console.log(childrenKey + ' still has children');
          // parent still has other children, so stop the recursion up the parents
          stop = true;
        }

      }
      else {
        //console.log('check the global node itself');
        // we need to check the subscripts against the global node itself
        //console.log('global level - remove ' + child + ' from ' + childrenRoot);
        redis.deleteZMember.call(this, childrenRoot, child);
        //console.log('check top level childrenRoot = ' + childrenRoot);
        if (redis.countZMembers.call(this, childrenRoot) === 0) {
          // no children left, so delete the node
          //console.log('global node has no children so delete ' + nodeRoot);
          redis.deleteKey.call(this, nodeRoot);
        }
        // at the top now, so stop
        stop = true;
      }
      //console.log('stop = ' + stop);
    } while (!stop);
  }
}

module.exports = deleteNode;
