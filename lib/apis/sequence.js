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

var padIfInteger = require('../utils/padIfInteger');
var clone = require('../utils/cloneArray');
var flattenArray = require('../utils/flattenArray');
var stripLeadingZeros = require('../utils/stripLeadingZeros');
var globalExists = require('../redis/commands/globalExists');

var redis = {
  addZMember: require('../redis/commands/addZMember'),
  countZMembers: require('../redis/commands/countZMembers'),
  deleteZMember: require('../redis/commands/deleteZMember'),
  getZMemberIndex: require('../redis/commands/getZMemberIndex'),
  getZMemberByIndex: require('../redis/commands/getZMemberByIndex'),
};

function sequence(node, direction) {
  //console.log('next: ' + JSON.stringify(node));
  var global = node.global;
  // does global exist?
  if (!globalExists.call(this, global)) {
    return {
      global: global,
      subscripts: node.subscripts
    };
  }

  var subscripts = clone(node.subscripts);
  if (global) {
    var parentSubs = subscripts.slice(0, -1);
    var seed = subscripts.slice(-1)[0];
    var seedAfter = padIfInteger.call(this, seed);
    //console.log('** seed = ' + seed + '; after: ' + seedAfter);
    seed = seedAfter;
    var key = 'children:' + global;
    if (parentSubs.length > 0) key = key + this.key_separator + flattenArray.call(this, parentSubs);
    var index;
    var next;
    var tempMember;
    if (seed === '') {
      index = -1;
      if (direction === 'previous') {
        index = redis.countZMembers.call(this, key);
      }
    }
    else {
      index = redis.getZMemberIndex.call(this, key, seed);
      //console.log('seed: ' + seed + '; index = ' + index);
      // if the seed subscript value doesn't exist, add it temporarily
      //  and use it as the seed

      if (index === null) {
        tempMember = seed;
        result = redis.addZMember.call(this, key, tempMember);
        //console.log('added tempMember: ' + tempMember + '; result ' + JSON.stringify(result));
        index = redis.getZMemberIndex.call(this, key, tempMember);
        //console.log('index of temporarily added member: ' + JSON.stringify(index));
      }

    }
    if (direction === 'next') index++;
    if (direction === 'previous') {
      index--;
      if (index === -1) {
        next = '';
        parentSubs.push(next);
        if (tempMember) redis.deleteZMember.call(this, key, tempMember);
        return {
          ok: 1,
          global: global,
          result: next,
          subscripts: parentSubs
        };
      }
    }
    result = redis.getZMemberByIndex.call(this, key, index);
    var next = result || '';

    if (next !== '' && next.toString().charAt(0) === this.key_separator) {
      next = stripLeadingZeros(next);
    }

    parentSubs.push(next);
    if (tempMember) redis.deleteZMember.call(this, key, tempMember);
    return {
      ok: 1,
      global: global,
      result: next,
      subscripts: parentSubs
    };
  }
  else {
    return {ok: 0};
  }
};

module.exports = sequence;

