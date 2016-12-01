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

var globalExists = require('../redis/commands/globalExists');
var clone = require('../utils/cloneArray');
var flattenArray = require('../utils/flattenArray');

var redis = {
  getZMemberIndex: require('../redis/commands/getZMemberIndex'),
  addZMember: require('../redis/commands/addZMember'),
  getZMemberndex: require('../redis/commands/getZMemberIndex'),
  countZMembers: require('../redis/commands/countZMembers'),
  deleteZMember: require('../redis/commands/deleteZMember'),
  getZMemberByIndex: require('../redis/commands/getZMemberByIndex'),
};

function leafNodes(node, direction) {
  //console.log('next_node: ' + JSON.stringify(node));
  direction = direction || 'forwards';
  if (direction !== 'forwards' && direction !== 'backwards') direction = 'forwards';
  var global = node.global;
  if (global) {
    var result;
    // does global exist?
    if (!globalExists.call(this, global)) {
      return {
        global: global,
        defined: 0
      };
    }
    // global exists

    var key = 'leaves:' + global;
    var subscripts = clone(node.subscripts);
    var member;
    if (subscripts.length > 0) member = flattenArray.call(this, subscripts);
    var index;

    var max;
    var min;
    if (member) {
      // a subscript has been specified - see if it exists as a leaf node
      index = redis.getZMemberIndex.call(this, key, member);
      //console.log('index = ' + index);
      var tempMember;
      if (index === null) {
        //console.log('index undefined');
        //  the specified subscripts dont point to a leaf node so 
        //  get the nearest leaf node in collating sequence

        //  do this by temporarily adding the subscript to the leaf list,
        //  get the next or previous index and delete the temporary subscript

        tempMember = member + this.key_separator;
        result = redis.addZMember.call(this, key, tempMember);
        //console.log('added tempMember: ' + tempMember + ' to ' + key + '; ' + JSON.stringify(result));
        index = redis.getZMemberIndex.call(this, key, tempMember);
        //console.log('index of temporarily added member: ' + JSON.stringify(index));
      }
      // get the next or previous member
      if (direction === 'forwards') {
        index++;
        max = redis.countZMembers.call(this, key);
        if (index === max) {
          // fallen off the end
          if (tempMember) redis.deleteZMember.call(this, key, tempMember);
          return {
            global: global,
            defined: 0
          };
        }
        else {
          // retrieve the member
          result = redis.getZMemberByIndex.call(this, key, index);
          if (tempMember) redis.deleteZMember.call(this, key, tempMember);
          return this.get({
            global: global,
            subscripts: result.split(this.key_separator)
          });
        }
      }
      else {
        index--;
        if (index === -1) {
          // fallen off the top
          if (tempMember) redis.deleteZMember.call(this, key, tempMember);
          return {
            global: global,
            defined: 0
          };
        }
        else {
          // retrieve the member
          result = redis.getZMemberByIndex.call(this, key, index);
          if (tempMember) redis.deleteZMember.call(this, key, tempMember);
          return this.get({
            global: global,
            subscripts: result.split(this.key_separator)
          });
        }
      }
    }
    else {
      // no subscripts specified - get first or last leaf node
      if (direction === 'forwards') {
        // retrieve the first member
        result = redis.getZMemberByIndex.call(this, key, 0);
        return this.get({
          global: global,
          subscripts: result.split(this.key_separator)
        });
      }
      else {
        // retrieve the last member
        index = redis.countZMembers.call(this, key) - 1;
        result = redis.getZMemberByIndex.call(this, key, index);
        return this.get({
          global: global,
          subscripts: result.split(this.key_separator)
        });
      }
    }
  }
  else {
    return {ok: 0};
  }
};

module.exports = leafNodes;
