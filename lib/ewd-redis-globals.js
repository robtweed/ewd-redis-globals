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

var buildNo = '0.3';

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
      unlock: require('./apis/unlock'),
      setAsync: require('./apis/setAsync'),
      getAsync: require('./apis/getAsync'),
      killAsync: require('./apis/killAsync'),
      openAsync: require('./apis/openAsync'),
      closeAsync: require('./apis/closeAsync'),
      versionAsync: require('./apis/versionAsync'),
      sequenceAsync: require('./apis/sequenceAsync')
};

function db(netx_config) {
  var defaults = {
    host: 'localhost',
    port: 6379,
    integer_padding: 10,
    key_separator: String.fromCharCode(1),
    async: false
  };
  netx_config = netx_config || defaults;
  for (var name in defaults) {
    if (typeof netx_config[name] === 'undefined') netx_config[name] = defaults[name];
  }

  if (netx_config.async) {
    // uses the standard Node.js redis module (npm install redis)
    var redis = require('redis');
    this.client = redis.createClient({
      host: netx_config.host,
      port: netx_config.port
    });
    this.open = this.openAsync;
    this.close = this.closeAsync;
    this.set = this.setAsync;
    this.get = this.getAsync;
    this.kill = this.killAsync;
    this.version = this.versionAsync;
    this.order = function(node, callback) {
      this.sequenceAsync(node, 'next', callback);
    };
    this.previous = function(node, callback) {
      this.sequenceAsync(node, 'previous', callback);
    };
    this.next = this.order;
  }
  else {
    var netx = require('tcp-netx');
    this.tcp = new netx.server(netx_config.host, netx_config.port);
  }
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
proto.set = apis.set;

proto.openAsync = apis.openAsync;
proto.closeAsync = apis.closeAsync;
proto.setAsync = apis.setAsync;
proto.getAsync = apis.getAsync;
proto.killAsync = apis.killAsync;
proto.sequenceAsync = apis.sequenceAsync;
proto.versionAsync = apis.versionAsync;

proto.version = apis.version;
proto.kill = apis.kill;
proto.get = apis.get;
proto.redis = apis.redis;
proto.data = apis.data;
proto.increment = apis.increment;

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
