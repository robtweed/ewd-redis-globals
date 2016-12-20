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

function version(callback) {
  this.client.info('server', function(err, result) {
    console.log('info result: ' + JSON.stringify(result));
    var pieces = result.split('\r\n');
    var data = {};
    pieces.forEach(function(item) {
      if (item !== '') {
        if (item.indexOf(':') !== -1) {
          var pieces = item.split(':');
          data[pieces[0]] = pieces[1];
        }
        else {
          data[item] = '';
        }
      }
    });
    callback('Node.js Redis Client; Redis version ' + data.redis_version);
  });
}

module.exports = version;