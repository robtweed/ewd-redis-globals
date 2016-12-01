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
  addHProperty: require('../redis/commands/addHProperty'),
  addHProperties: require('../redis/commands/addHProperties'),
  addZMember: require('../redis/commands/addZMember'),
  keyExists: require('../redis/commands/keyExists')
};

function createNode(global, subscripts, value) {
  var noOfSubscripts = subscripts.length;
  var nodeRoot = 'node:' + global;
  var leavesKey = 'leaves:' + global;
  var childrenRoot = 'children:' + global;
  var properties;
  if (noOfSubscripts === 0) {
    // top-level global node is the leaf node
    properties = [
      {name: 'data', value: 1},
      {name: 'value', value: value}
    ];
    redis.addHProperties.call(this, nodeRoot, properties);
    return;
  }
  else {
    // subscripted node is the leaf node

    //create the leaf node

    var flatSubs = flattenArray.call(this, subscripts);
    nodeKey = nodeRoot + this.key_separator + flatSubs;
    var properties = [
      {name: 'data', value: 1},
      {name: 'value', value: value}
    ];
    redis.addHProperties.call(this, nodeKey, properties); 
    redis.addZMember.call(this, leavesKey, flatSubs);

    // now go up each parent creating the
    //  intermediate nodes if the don't exist
    //  and add the child subscript to the parent's
    //  children list
    //console.log('subscripts start as ' + JSON.stringify(subscripts));
    var stop = false;
    do {
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
        redis.addZMember.call(this, childrenKey, child);  // add child to parent's subscript list
        //console.log('check if node ' + nodeKey + ' exists..');
        if (!redis.keyExists.call(this, nodeKey)) {
          redis.addHProperty.call(this, nodeKey, 'data', 10); // create intermediate node 
        }
        else {
          //console.log('node ' + nodeKey + ' already exists');
          stop = true; // parent nodes already exist so don't go any further
        }
      }
      else {
        // add child to subscripts of the global itself

        redis.addZMember.call(this, childrenRoot, child);

        // see if we have to set the global node too
        //console.log('check if global node ' + nodeRoot + ' exists..');
        if (!redis.keyExists.call(this, nodeRoot)) {
          //console.log('no - global node needs creating');
          redis.addHProperty.call(this, nodeRoot, 'data', 10); // create top-level global node 
        }
        stop = true;
      }
    } while (!stop);
  }
  //console.log('set complete\r\n');
}

module.exports = createNode;
