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

  7 December 2016

*/

var buildNo = '0.2';

var apis = {
  version: require('./apis/version'),
  open: require('./apis/open'),
  close: require('./apis/close'),
  redis: require('./apis/redis'),
  set: require('./apis/set'),
  get: require('./apis/get'),
  data: require('./apis/data'),
  increment: require('./apis/increment'),
  kill: require('./apis/kill'),
  sequence: require('./apis/sequence'),
  leafNodes: require('./apis/leafNodes'),
  global_directory: require('./apis/globalDirectory'),
  lock: require('./apis/lock'),
  unlock: require('./apis/unlock')
};

function db(netx_config) {
  var defaults = {
    host: 'localhost',
    port: 6379,
    integer_padding: 10,
    key_separator: String.fromCharCode(1)
  };
  netx_config = netx_config || defaults;
  for (var name in defaults) {
    if (!netx_config[name]) netx_config[name] = defaults[name];
  }

  var netx = require('tcp-netx');
  this.tcp = new netx.server(netx_config.host, netx_config.port);

  this.integer_padding = netx_config.integer_padding;
  this.key_separator = netx_config.key_separator;
}

proto = db.prototype;

proto.buildNo = function() {
  return buildNo;
};

proto.about = function() {
  return 'ewd-redis-globals: Redis-based emulation of Global Storage database';
};

proto.open = apis.open;
proto.close = apis.close;
proto.version = apis.version;
proto.redis = apis.redis;
proto.set = apis.set;
proto.get = apis.get;
proto.data = apis.data;
proto.increment = apis.increment;
proto.kill = apis.kill;
proto.lock = apis.lock;
proto.unlock = apis.unlock;
proto.global_directory = apis.global_directory;

proto.next = function(node) {
  return apis.sequence.call(this, node, 'next');
};

proto.order = function(node) {
  return apis.sequence.call(this, node, 'next');
};

proto.previous = function(node) {
  return apis.sequence.call(this, node, 'previous');
};

proto.next_node = function(node) {
  return apis.leafNodes.call(this, node, 'forwards');
};

proto.previous_node = function(node) {
  return apis.leafNodes.call(this, node, 'backwards');
};


module.exports = db;