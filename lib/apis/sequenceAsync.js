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

var padIfInteger = require('../utils/padIfInteger');
var clone = require('../utils/cloneArray');
var flattenArray = require('../utils/flattenArray');
var stripLeadingZeros = require('../utils/stripLeadingZeros');

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


function getNext(direction, index, key, parentSubs, tempMember, globalName, callback) {
  var self = this;
  if (direction === 'next') index++;
  var next;
  if (direction === 'previous') {
    index--;
    if (index === -1) {
      next = '';
      parentSubs.push(next);
      var response = {
        ok: 1,
        global: globalName,
        result: next,
        subscripts: parentSubs
      };
      if (tempMember) {
        this.client.zrem(key, tempMember, function(err, result) {
          callback(false, response);
        });
      }
      else {
        callback(false, response);
        return;
      }
    }
  }
  //console.log('key: ' + key + '; index: ' + index);
  this.client.zrange(key, index, index, function(err, result) {
    //console.log('** result = ' + result);
    var next = result[0] || '';

    if (next !== '' && next.toString().charAt(0) === self.key_separator) {
      next = stripLeadingZeros(next);
    }

    parentSubs.push(next);
    var output = {
      ok: 1,
      global: globalName,
      result: next,
      subscripts: parentSubs
    };
    if (tempMember) {
      self.client.zrem(key, tempMember, function(err, result) {
        callback(false, output);
      });
    }
    else {
      //console.log('** callback response: ' + JSON.stringify(output));
      callback(false, output);
    }
  });
}


function sequence(node, direction, callback) {
  //console.log('next: ' + JSON.stringify(node));
  var self = this;
  var globalName = node.global;
  if (globalName) {
    // does global exist?
    globalExists.call(this, globalName, function(exists) {
      if (!exists) {
        callback(false, {
          global: globalName,
          subscripts: node.subscripts
        });
        return;
      }
      else {
        var subscripts = clone(node.subscripts);
        var parentSubs = subscripts.slice(0, -1);
        var seed = subscripts.slice(-1)[0];
        var seedAfter = padIfInteger.call(self, seed);
        //console.log('** seed = ' + seed + '; after: ' + seedAfter);
        seed = seedAfter;
        var key = 'children:' + globalName;
        if (parentSubs.length > 0) key = key + self.key_separator + flattenArray.call(self, parentSubs);
        var index;
        var next;
        var tempMember;
        if (seed === '') {
          index = -1;
          if (direction === 'previous') {
            self.client.zcard(key, function(err, index) {
              getNext.call(self, direction, index, key, parentSubs, tempMember, globalName, callback);
              return;
            });
          }
          else {
            //console.log(direction + '; ' + index + '; ' + key + '; ' + parentSubs + '; ' + tempMember);
            getNext.call(self, direction, index, key, parentSubs, tempMember, globalName, callback);
            return;
          }
        }
        else {
          self.client.zrank(key, seed, function(err, index) {
            //console.log('seed: ' + seed + '; index = ' + index);
            // if the seed subscript value doesn't exist, add it temporarily
            //  and use it as the seed
  
            if (index === null) {
              tempMember = seed;
              self.client.zadd(key, tempMember, function(err, result) {
                //console.log('added tempMember: ' + tempMember + '; result ' + JSON.stringify(result));
                self.client.zrank(key, tempMember, function(err, index) {
                  //console.log('index of temporarily added member: ' + JSON.stringify(index));
                  getNext.call(self, direction, index, key, parentSubs, tempMember, globalName, callback);
                  return;
                });
              });
            }
            else {
              getNext.call(self, direction, index, key, parentSubs, tempMember, globalName, callback);
              return;
            }
          });
        }
      }
    });
  }
  else {
    callback('Global was not specified');
  }
};

module.exports = sequence;
